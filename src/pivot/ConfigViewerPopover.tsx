import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ClipboardCopy, EyeIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { usePivotConfig } from './config/ConfigContext';

function ConfigViewerPopover() {
  const { fields } = usePivotConfig();

  const [open, setOpen] = useState(false);

  const { t } = useTranslation();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(fields, null, 2));
      toast.success(t('configuredAndCopied'));
    } catch {
      toast.error(t('failedToCopy'));
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className="my-4">
        <Button variant="outline" size="sm" className="select-none">
          <EyeIcon className="h-4 w-4 mr-1" />
          {t('configuration')}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="max-h-[400px] overflow-auto p-0 mx-4">
        <div className="sticky top-0 z-10 bg-white border-b px-4 py-2 flex justify-between items-center">
          <h4 className="font-semibold text-sm text-muted-foreground">
            {t('currentConfiguration')}
          </h4>
          <Button size="sm" variant="ghost" onClick={handleCopy}>
            <ClipboardCopy className="h-4 w-4 mr-1" />
            {t('copy')}
          </Button>
        </div>
        <pre className="bg-muted text-xs p-3 rounded-md overflow-x-auto whitespace-pre-wrap">
          {JSON.stringify(fields, null, 2)}
        </pre>
      </PopoverContent>
    </Popover>
  );
}

export default ConfigViewerPopover;
