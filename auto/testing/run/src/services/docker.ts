import { runCommand } from "./shell";
import { logInfo, logError, logDebug } from "../utils/logger";
import path from "path";

// Interface for Docker image configuration
interface DockerImage {
    name: string;
    path: string;
    tag?: string;
    buildArgs?: Record<string, string>;
    dockerfile?: string;
}

// Interface for build result
interface BuildResult {
    imageName: string;
    success: boolean;
    output?: string;
    error?: Error;
    buildTime?: number;
}

// Helper to validate path exists
const validatePath = async (imagePath: string): Promise<boolean> => {
    try {
        await runCommand(`test -d "${imagePath}" || exit 1`);
        return true;
    } catch {
        return false;
    }
};

// Helper to check if Docker is running
const checkDockerDaemon = async (): Promise<boolean> => {
    try {
        await runCommand("docker info");
        return true;
    } catch {
        return false;
    }
};

// Helper to normalize path
const normalizePath = (imagePath: string): string => {
    return path.resolve(__dirname, imagePath);
};

// Main function to create Docker images
export const createDockerImages = async (
    customImages?: DockerImage[]
): Promise<BuildResult[]> => {
    try {
        // Check if Docker daemon is running
        if (!(await checkDockerDaemon())) {
            throw new Error("Docker daemon is not running");
        }

        // Default images configuration
        const defaultImages: DockerImage[] = [
            {
                name: "seed-node-tripcode",
                path: "../../../../../../seed-node-tripcode",
            },
            {
                name: "validator-node-tripcode",
                path: "../../../../../../validator-node-tripcode",
            },
        ];

        // Use custom images if provided, otherwise use defaults
        const images = customImages || defaultImages;

        logInfo(`Starting Docker image creation for ${images.length} images`);

        // Process each image
        const buildPromises = images.map(async (image): Promise<BuildResult> => {
            const startTime = Date.now();
            const normalizedPath = normalizePath(image.path);

            try {
                // Validate path exists
                if (!(await validatePath(normalizedPath))) {
                    throw new Error(`Invalid path: ${normalizedPath}`);
                }

                logDebug(`Building image ${image.name}`, {
                    path: normalizedPath,
                    tag: image.tag || "latest",
                    hasCustomDockerfile: !!image.dockerfile,
                });

                // Construct build command
                let buildCommand = `docker build -t ${image.name}:${image.tag || "latest"}`;

                // Add build arguments if specified
                if (image.buildArgs) {
                    Object.entries(image.buildArgs).forEach(([key, value]) => {
                        buildCommand += ` --build-arg ${key}=${value}`;
                    });
                }

                // Add dockerfile path if specified
                if (image.dockerfile) {
                    buildCommand += ` -f ${image.dockerfile}`;
                }

                buildCommand += ` "${normalizedPath}"`;

                // Execute build
                const result = await runCommand(buildCommand);

                const buildTime = Date.now() - startTime;
                logInfo(`Successfully built image ${image.name}`, {
                    buildTime: `${buildTime}ms`,
                    size: await getImageSize(image.name),
                });

                return {
                    imageName: image.name,
                    success: true,
                    output: result.stdout,
                    buildTime,
                };
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Unknown error";
                logError(`Failed to build image ${image.name}`, error instanceof Error ? error : undefined, {
                    path: normalizedPath,
                    buildTime: `${Date.now() - startTime}ms`,
                });

                return {
                    imageName: image.name,
                    success: false,
                    error: error instanceof Error ? error : new Error(errorMessage),
                };
            }
        });

        // Execute all builds in parallel
        const results = await Promise.all(buildPromises);

        // Log summary
        const successful = results.filter((r) => r.success).length;
        const failed = results.filter((r) => !r.success).length;

        logInfo("Docker build summary", {
            total: results.length,
            successful,
            failed,
        });

        return results;
    } catch (error) {
        logError("Fatal error during Docker image creation", error instanceof Error ? error : new Error("Unknown error"));
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

// Export additional utility functions
export const dockerUtils = {
    validatePath,
    checkDockerDaemon,
    getImageSize,
};
