import { Dropdown } from 'flowbite-react';

type DropDownProps = {
  label: string;
  children: React.ReactNode;
  inline?: boolean;
  size?: 'sm' | 'md' | 'lg';
};

export const AvaDropdown: React.FC<DropDownProps> = ({
  label,
  children,
  inline = true,
  size = 'sm',
}) => {
  return (
    <Dropdown
      theme={{
        arrowIcon: 'ml-2 h-4 w-4',
        content: 'py-1 focus:outline-none',
        floating: {
          animation: 'transition-opacity',
          arrow: {
            base: 'absolute z-10 h-2 w-2 rotate-45',
            style: {
              dark: 'bg-gray-900 dark:bg-gray-700',
              light: 'bg-white',
              auto: 'bg-white dark:bg-gray-700',
            },
            placement: '-4px',
          },
          base: 'z-10 w-fit rounded divide-y divide-gray-100 shadow focus:outline-none',
          content: 'py-1 text-sm text-dark dark:text-light',
          divider: 'my-1 h-px bg-base dark:bg-light',
          header: 'block py-2 px-4 text-sm text-gray-700 dark:text-gray-200',
          hidden: 'invisible opacity-0',
          item: {
            container: '',
            base: 'flex items-center justify-start py-2 px-4 text-sm text-light cursor-pointer w-full hover:bg-dark focus:bg-dark dark:text-light dark:hover:bg-dark focus:outline-none dark:hover:text-light dark:focus:bg-darker dark:focus:text-light',
            icon: 'mr-2 h-4 w-4',
          },
          style: {
            dark: 'bg-gray-900 text-white dark:bg-gray-700',
            light: 'border border-gray-200 bg-white text-gray-900',
            auto: 'border border-gray-200 bg-white text-gray-900 dark:border-none dark:bg-gray-700 dark:text-white',
          },
          target: 'w-fit',
        },
        inlineWrapper: 'flex items-center',
      }}
      inline={inline}
      size={size}
      label={label}
    >
      {children}
    </Dropdown>
  );
};
