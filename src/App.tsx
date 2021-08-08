import { ReactComponent as MinimizeSvg } from './minimize.svg';
import { ReactComponent as MaximizeSvg } from './maximize.svg';
import { ReactComponent as CloseSvg } from './close.svg';
import { useState, useEffect } from 'react';
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

  const [title, setTitle] = useState();
  const [version, setVersion] = useState();
  const [update, setUpdate] = useState('none');

  useEffect(() => {
    setTitle(ipc.sendSync('app', 'title'));
    setVersion(ipc.sendSync('app', 'version'));
  }, []);

  ipc.on('update', (e:any, arg:any) => {
    if(arg == 'available') {
      setUpdate('available');
    }

    if(arg == 'downloaded') {
      setUpdate('downloaded');
    }
  });

  return (
    <>
      <div className="bg-gray-900 border-b border-gray-800 flex justify-between appBar items-center pl-1">
        <span className="text-gray-500">{ title }<span className="ml-1 font-light">v{ version }</span></span>
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
      <div>{ update }</div>
      <div><button onClick={restart}>Restart</button></div>
    </>
  );
}

export default App;
