import { ReactComponent as MinimizeSvg } from './minimize.svg';
import { ReactComponent as MaximizeSvg } from './maximize.svg';
import { ReactComponent as CloseSvg } from './close.svg';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';
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

  const restart = async () => {
    await ipc.send('app', 'update')
  }

  const asEnable = async () => {
    await ipc.send('app', 'autostart-enable')
  }

  const asDisable = async () => {
    await ipc.send('app', 'autostart-disable')
  }

  const ctxMenu = async () => {
    await ipc.send('menu', 'appBar')
  }

  const [title, setTitle] = useState();
  const [version, setVersion] = useState();
  const [update, setUpdate] = useState('none');

  useEffect(() => {
    setTitle(ipc.sendSync('app', 'title'));
    setVersion(ipc.sendSync('app', 'version'));
  }, []);

  ipc.on('update', (e:any, arg:any) => {
    if(arg === 'available') {
      setUpdate('available');
    }

    if(arg === 'downloaded') {
      setUpdate('downloaded');
    }
  });

  return (
    <>
      <div className="bg-gray-900 border-b border-gray-800 flex justify-between appBar items-center pl-1 sticky top-0 left-0 right-0">
        <span className="text-gray-500" onClick={ctxMenu}>{ title }</span>
        <div className="flex">
          {
            update === 'downloaded' && <span className="updateAvailable cursor-pointer px-2" onClick={restart}>
              <FontAwesomeIcon icon={faSyncAlt} />
            </span>
          }
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
