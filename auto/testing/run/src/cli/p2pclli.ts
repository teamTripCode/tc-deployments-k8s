import inquirer from 'inquirer';
import { deployNodes } from '../services/kubernetes';

// Definimos un tipo para las opciones del menú
type MenuAction = 'Desplegar Red P2P' | 'Eliminar Red P2P' | 'Estado de Red P2P' | 'Salir';

const port = process.env.PORT || 3000;

// Función para abrir la página de estado en el navegador predeterminado
const openStatusPage = async () => {
  const open = (await import('open')).default;
  await open(`http://localhost:${port}/status/pods`);
};

export const mainMenu = async (): Promise<void> => {
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

  switch (answers.action) {
    case 'Desplegar Red P2P':
      console.log('Desplegando Red P2P...');
      await deployNodes('create');
      break;

    case 'Eliminar Red P2P':
      console.log('Eliminando Red P2P...');
      await deployNodes('remove');
      break;

    case 'Estado de Red P2P':
      console.log('Obteniendo estado de la Red P2P...');
      await openStatusPage()
      break;

    case 'Salir':
      console.log('Saliendo...');
      process.exit(0);

    default:
      console.log('Opción no válida.');
      break;
  }

  // Volvemos al menú principal después de cada acción
  mainMenu();
};
