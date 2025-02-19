import inquirer from 'inquirer';
import { deployNodes } from '../services/kubernetes';
import { AdmindeployChain } from '../controllers/deploymentController';
import { logInfo, logError, logWarn, logDebug } from '../utils/logger';
import { MenuAction } from './types';

const port = process.env.PORT || 3000;

// Enhanced status page opener with error handling
const openStatusPage = async (): Promise<void> => {
    try {
        logDebug('Attempting to open status page in browser');
        const open = (await import('open')).default;
        await open(`http://localhost:${port}/status/pods`);
        logInfo('Status page opened successfully');
    } catch (error) {
        logError('Failed to open status page', error instanceof Error ? error : new Error('Unknown error'));
        throw error;
    }
};

// Enhanced main menu with better error handling and logging
export const mainMenu = async (): Promise<void> => {
    try {
        logDebug('Displaying main menu');
        
        const answers = await inquirer.prompt<{
            action: MenuAction;
        }>({
            type: 'list',
            name: 'action',
            message: 'Seleccione una opción:',
            choices: [
                'Desplegar Red P2P',
                'Eliminar Red P2P',
                'Estado de Red P2P',
                'Salir',
            ],
        });

        // Log the selected action
        logInfo(`Usuario seleccionó: ${answers.action}`);

        switch (answers.action) {
            case 'Desplegar Red P2P':
                logInfo('Iniciando despliegue de Red P2P...');
                try {
                    await AdmindeployChain('create');
                    logInfo('Despliegue completado exitosamente');
                } catch (error) {
                    logError('Error durante el despliegue', error instanceof Error ? error : new Error('Unknown error'));
                }
                break;

            case 'Eliminar Red P2P':
                logInfo('Iniciando eliminación de Red P2P...');
                try {
                    await deployNodes('remove');
                    logInfo('Eliminación completada exitosamente');
                } catch (error) {
                    logError('Error durante la eliminación', error instanceof Error ? error : new Error('Unknown error'));
                }
                break;

            case 'Estado de Red P2P':
                logInfo('Obteniendo estado de Red P2P...');
                try {
                    await openStatusPage();
                } catch (error) {
                    logWarn('No se pudo abrir la página de estado automáticamente');
                    logInfo(`Por favor, abra manualmente: http://localhost:${port}/api/status/pods`);
                }
                break;

            case 'Salir':
                logInfo('Cerrando aplicación...');
                process.exit(0);

            default:
                logWarn(`Opción no válida: ${answers.action}`);
                break;
        }

        // Recursive call with error handling
        logDebug('Volviendo al menú principal');
        await mainMenu();
    } catch (error) {
        logError('Error en el menú principal', error instanceof Error ? error : new Error('Unknown error'));
        // Give the user a chance to retry
        const retry = await inquirer.prompt<{ shouldRetry: boolean }>({
            type: 'confirm',
            name: 'shouldRetry',
            message: '¿Desea volver al menú principal?',
            default: true,
        });

        if (retry.shouldRetry) {
            logInfo('Reiniciando menú principal...');
            await mainMenu();
        } else {
            logInfo('Cerrando aplicación por error...');
            process.exit(1);
        }
    }
};