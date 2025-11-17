import LogoButton from './LogoButton';
import UserIcon from './UserIcon';

export default function Header() {
  return (
    <header className="w-full h-16 bg-primary-900 shadow-md fixed top-0 left-0 z-50">
      <div className="container mx-auto h-full flex justify-between items-center px-4">
        <LogoButton />
        <UserIcon onClick={() => console.log('User icon clicked')} />
      </div>
    </header>
  );
}
