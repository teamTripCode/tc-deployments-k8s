import { runCommand } from "./shell";
import { logInfo, logError, logDebug } from "../utils/logger";
import { BuildResult, DockerImage, SystemType, TypeAction } from "./types";
import { PathsDockers } from "./config";

// Helper to process Windows paths correctly
const processWindowsPath = (windowsPath: string): string => {
    // Replace single backslashes with double backslashes for Windows paths
    // This ensures they are properly escaped in strings
    return windowsPath.replace(/\\/g, '\\\\');
};

// Helper to validate path exists based on OS
const validatePath = async (imagePath: string, system: SystemType): Promise<boolean> => {
    try {
        let pathToCheck = imagePath;
        
        // Process Windows paths properly
        if (system === 'windows') {
            pathToCheck = processWindowsPath(imagePath);
        }
        
        if (system === 'linux') {
            await runCommand(`test -d "${pathToCheck}" || exit 1`);
        } else {
            // Windows command to check if directory exists
            // Use CMD syntax with escaped quotes
            await runCommand(`if not exist "${pathToCheck}" exit 1`);
        }
        return true;
    } catch (error) {
        logError(`Path validation failed for ${imagePath}`, error instanceof Error ? error : undefined);
        return false;
    }
};

// Helper to check if Docker is running
const checkDockerDaemon = async (system: SystemType): Promise<boolean> => {
    try {
        if (system === 'linux') {
            await runCommand("systemctl is-active docker");
        } else {
            // Windows command to check Docker service
            await runCommand("docker info");
        }
        return true;
    } catch {
        return false;
    }
};

// Main function to manage Docker images
export const ManageDockerImages = async (
    type: TypeAction,
    customImages?: DockerImage[]
): Promise<BuildResult[]> => {
    try {
        const defaultImages: DockerImage[] = PathsDockers;
        const images = customImages || defaultImages;

        // Validate at least one image exists
        if (images.length === 0) {
            throw new Error("No images provided");
        }

        // Check if Docker daemon is running based on first image's system type
        if (!(await checkDockerDaemon(images[0].system))) {
            throw new Error("Docker daemon is not running");
        }

        const action = type === 'create' ? 'create' : 'remove';
        logInfo(`Starting Docker image ${action} for ${images.length} images`);

        // Process each image
        const operationPromises = images.map(async (image): Promise<BuildResult> => {
            const startTime = Date.now();

            try {
                if (type === 'create') {
                    // Validate path exists for creation
                    if (!(await validatePath(image.path, image.system))) {
                        throw new Error(`Invalid path: ${image.path}`);
                    }

                    logDebug(`Building image ${image.name}`, {
                        path: image.path,
                        tag: image.tag || "latest",
                        hasCustomDockerfile: !!image.dockerfile,
                        system: image.system
                    });

                    // Construct build command
                    let buildCommand = `docker build -t ${image.name}:${image.tag || "latest"}`;

                    // Add build arguments if specified
                    if (image.buildArgs) {
                        Object.entries(image.buildArgs).forEach(([key, value]) => {
                            buildCommand += ` --build-arg ${key}=${value}`;
                        });
                    }

                    // Add dockerfile path if specified, using OS-specific path handling
                    if (image.dockerfile) {
                        const dockerfilePath = image.system === 'windows'
                            ? image.dockerfile.replace(/\//g, '\\')
                            : image.dockerfile;
                        buildCommand += ` -f ${dockerfilePath}`;
                    }

                    // Add context path with proper escaping based on OS
                    const contextPath = image.system === 'windows'
                        ? image.path.replace(/\//g, '\\')
                        : image.path;
                    buildCommand += ` "${contextPath}"`;

                    // Execute build
                    const result = await runCommand(buildCommand);

                    const buildTime = Date.now() - startTime;
                    logInfo(`Successfully built image ${image.name}`, {
                        buildTime: `${buildTime}ms`,
                        size: await getImageSize(image.name),
                        system: image.system
                    });

                    return {
                        imageName: image.name,
                        success: true,
                        output: result.stdout,
                        buildTime,
                    };
                } else {
                    // Remove image
                    logDebug(`Removing image ${image.name}`);

                    const imageTag = image.tag || "latest";
                    const removeCommand = `docker rmi ${image.name}:${imageTag}`;

                    const result = await runCommand(removeCommand);

                    const removeTime = Date.now() - startTime;
                    logInfo(`Successfully removed image ${image.name}:${imageTag}`, {
                        removeTime: `${removeTime}ms`,
                        system: image.system
                    });

                    return {
                        imageName: image.name,
                        success: true,
                        output: result.stdout,
                        buildTime: removeTime,
                    };
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Unknown error";
                const operation = type === 'create' ? 'build' : 'remove';
                logError(`Failed to ${operation} image ${image.name}`, error instanceof Error ? error : undefined, {
                    path: type === 'create' ? image.path : undefined,
                    operationTime: `${Date.now() - startTime}ms`,
                    system: image.system
                });

                return {
                    imageName: image.name,
                    success: false,
                    error: error instanceof Error ? error : new Error(errorMessage),
                };
            }
        });

        // Execute all operations in parallel
        const results = await Promise.all(operationPromises);

        // Log summary
        const successful = results.filter((r) => r.success).length;
        const failed = results.filter((r) => !r.success).length;
        const operation = type === 'create' ? 'build' : 'removal';

        logInfo(`Docker ${operation} summary`, {
            total: results.length,
            successful,
            failed
        });

        return results;
    } catch (error) {
        const operation = type === 'create' ? 'creation' : 'removal';
        logError(`Fatal error during Docker image ${operation}`, error instanceof Error ? error : new Error("Unknown error"));
        throw error;
    }
};

// Helper to get image size
async function getImageSize(imageName: string): Promise<string> {
    try {
        const result = await runCommand(`docker image ls ${imageName} --format "{{.Size}}"`);
        return result.stdout.trim();
    } catch {
        return "unknown";
    }
}

export const dockerUtils = {
    validatePath,
    checkDockerDaemon,
    getImageSize,
};