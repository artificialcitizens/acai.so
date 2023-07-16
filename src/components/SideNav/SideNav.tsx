/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react';
import { Sidenav, initTE } from 'tw-elements';
import { useClickAway } from '@uidotdev/usehooks';
import { Link } from 'react-router-dom';
import { useInterpret } from '@xstate/react';
import { Workspace, appStateMachine, handleCreateTab } from '../../machines';

interface SideNavProps {
  isToggled: boolean;
  handleToggle: () => void;
}

export const SideNav: React.FC<SideNavProps> = ({ isToggled, handleToggle }) => {
  const service = useInterpret(appStateMachine);
  const [navVisible, setNavVisible] = useState(isToggled);
  const [workspaces, setWorkspaces] = useState<{ [id: string]: Workspace }>({}); // Update state to match new data model

  const ref = useClickAway(() => {
    handleToggle();
  });

  useEffect(() => {
    setNavVisible(isToggled);
  }, [isToggled]);

  useEffect(() => {
    initTE({ Sidenav });
  }, []);

  useEffect(() => {
    const subscription = service.subscribe((state) => {
      setWorkspaces(state.context.workspaces); // Update workspaces state
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [service]);

  const createWorkspace = () => {
    const id = Math.random().toString(36).substring(7);
    const newWorkspace: Workspace = {
      id,
      name: prompt('Enter a name for your new workspace') || 'New Workspace',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      private: false,
      settings: {
        webSpeechRecognition: false,
        tts: false,
        whisper: false,
      },
      data: {
        tiptap: {
          tabs: [
            {
              id: Date.now().toString(),
              title: 'New Tab',
              content: '',
              isContext: false,
              systemNote: '',
              workspaceId: id,
              createdAt: new Date().toISOString(),
              lastUpdated: new Date().toISOString(),
              filetype: 'markdown',
            },
          ],
        },
        chat: {},
        agentLogs: {
          thoughts: {},
          errors: {},
        },
        agentTools: {
          calculator: false,
          weather: false,
          googleSearch: false,
          webBrowser: false,
          createDocument: false,
        },
        notes: '',
      },
    };
    service.send({ type: 'ADD_WORKSPACE', workspace: newWorkspace });
  };

  // Function to create a new tab
  const createTab = (workspaceId) => {
    handleCreateTab({ title: 'New Tab', content: '' }, workspaceId, service.send);
  };

  return (
    <nav
      className="fixed left-0 top-0 z-[1035] h-screen w-60 -translate-x-full overflow-hidden bg-white shadow-[0_4px_12px_0_rgba(0,0,0,0.07),_0_2px_4px_rgba(0,0,0,0.05)] data-[te-sidenav-hidden='false']:translate-x-0 dark:bg-zinc-800"
      data-te-sidenav-init
      data-te-sidenav-hidden={!navVisible}
      data-te-sidenav-mode="push"
      data-te-sidenav-content="#content"
      ref={ref}
    >
      <ul className="relative m-0 list-none px-[0.2rem]" data-te-sidenav-menu-ref>
        {Object.values(workspaces).map((workspace) => (
          <li className="relative" key={workspace.id}>
            <Link
              className="flex h-12 cursor-pointer items-center truncate rounded-[5px] px-6 py-4 text-[0.875rem] text-gray-600 outline-none transition duration-300 ease-linear hover:bg-slate-50 hover:text-inherit hover:outline-none focus:bg-slate-50 focus:text-inherit focus:outline-none active:bg-slate-50 active:text-inherit active:outline-none data-[te-sidenav-state-active]:text-inherit data-[te-sidenav-state-focus]:outline-none motion-reduce:transition-none dark:text-gray-300 dark:hover:bg-white/10 dark:focus:bg-white/10 dark:active:bg-white/10"
              to={`/${workspace.id}`}
              data-te-sidenav-link-ref
            >
              <span>{workspace.name}</span>
            </Link>
            <button onClick={() => createTab(workspace.id)}>+</button>
            <ul
              className="!visible relative m-0 hidden list-none p-0 data-[te-collapse-show]:block "
              data-te-sidenav-collapse-ref
              data-te-collapse-show
            >
              {workspace.data.tiptap.tabs.map((tab) => (
                <li className="relative" key={tab.id}>
                  <Link
                    className="flex h-6 cursor-pointer items-center truncate rounded-[5px] py-4 pl-[3.4rem] pr-6 text-[0.78rem] text-gray-600 outline-none transition duration-300 ease-linear hover:bg-slate-50 hover:text-inherit hover:outline-none focus:bg-slate-50 focus:text-inherit focus:outline-none active:bg-slate-50 active:text-inherit active:outline-none data-[te-sidenav-state-active]:text-inherit data-[te-sidenav-state-focus]:outline-none motion-reduce:transition-none dark:text-gray-300 dark:hover:bg-white/10 dark:focus:bg-white/10 dark:active:bg-white/10"
                    to={`/${workspace.id}/${tab.id}`}
                    data-te-sidenav-link-ref
                  >
                    <span>{tab.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
        <button onClick={createWorkspace}>+</button>
      </ul>
    </nav>
  );
};
