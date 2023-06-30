import './header.css';

type User = {
  name: string;
};

interface HeaderProps {
  user?: User;
  onLogin?: () => void;
  onLogout?: () => void;
  onCreateAccount?: () => void;
}

export const Header = ({ user, onLogin, onLogout, onCreateAccount }: HeaderProps) => (
  <header className="max-w-[100vw]">
    <div className="storybook-header">
      <div>
        <h1 className="text-light">🧠 Second Brain</h1>
      </div>
      <div>{/* <SBSearch /> */}</div>
    </div>
  </header>
);
