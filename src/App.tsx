import { ReactComponent as MinimizeSvg } from './minimize.svg';
import { ReactComponent as MaximizeSvg } from './maximize.svg';
import { ReactComponent as CloseSvg } from './close.svg';
const ipc = window.require('electron').ipcRenderer

function App() {
  const minimize = async () => {
    await ipc.send('window', 'minimize');
  }

  const maximize = async () => {
    await ipc.send('window', 'maximize');
  }

  const close = async () => {
    await ipc.send('window', 'close');
  }

  return (
    <>
      <div className="bg-gray-900 border-b border-gray-800 flex justify-between appBar items-center pl-1">
        <span className="text-gray-500">
          electron-react-app
        </span>
        <div className="flex">
          <span className="text-gray-500 hover:text-gray-400 bg-transparent hover:bg-gray-800 cursor-pointer transition duration-500 py-1 px-2" onClick={minimize}>
            <MinimizeSvg />
          </span>
          <span className="text-gray-500 hover:text-gray-400 bg-transparent hover:bg-gray-800 cursor-pointer transition duration-500 py-1 px-2" onClick={maximize}>
            <MaximizeSvg />
          </span>
          <span className="text-gray-500 hover:text-white bg-transparent hover:bg-red-500 cursor-pointer transition duration-500 py-1 px-2" onClick={close}>
            <CloseSvg />
          </span>
        </div>
      </div>
    </>
  );
}

export default App;
