import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
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
          <Globe />
          {language}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
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
