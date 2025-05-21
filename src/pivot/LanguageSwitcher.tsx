import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';

function LanguageSwitcher({
  handleLanguageChange,
}: {
  handleLanguageChange: (lng: string) => void;
}) {
  const [language, setLanguage] = useState('en');

  const onLanguageChange = (lng: string) => {
    setLanguage(lng);
    handleLanguageChange(lng);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="capitalize">
          {language}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Change language</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={language} onValueChange={onLanguageChange}>
          <DropdownMenuRadioItem value="en">En</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="de">De</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
  return;
}

export default LanguageSwitcher;
