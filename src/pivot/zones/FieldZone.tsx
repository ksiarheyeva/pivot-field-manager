import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useDndMonitor, useDroppable } from '@dnd-kit/core';
import { zodResolver } from '@hookform/resolvers/zod';
import { AArrowDown, AArrowUp, Plus, Save, Search } from 'lucide-react';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { FieldConfig, usePivotConfig, ZoneType } from '../config/ConfigContext';
import FieldItem from '../items/FieldItem';

function FieldZone({ type }: { type: ZoneType }) {
  const { getFieldsForZone, updateZoneFields } = usePivotConfig();
  const { setNodeRef, isOver } = useDroppable({ id: type });
  const fields = getFieldsForZone(type);

  const originalRef = useRef<FieldConfig[] | null>(null);

  const [sortState, setSortState] = useState('default');
  const [search, setSearch] = useState('');

  const [activeId, setActiveId] = useState<string | null>(null);

  useDndMonitor({
    onDragStart(event) {
      setActiveId(event.active.id as string);
    },
    onDragEnd() {
      setActiveId(null);
    },
    onDragCancel() {
      setActiveId(null);
    },
  });

  function toggleSort() {
    const next = sortState === 'default' ? 'asc' : sortState === 'asc' ? 'desc' : 'default';

    setSortState(next);

    let sorted;
    const zoneFields = fields.filter((f) => f.zone === type);
    if (next === 'asc') {
      if (!originalRef.current) {
        originalRef.current = zoneFields;
      }
      sorted = [...fields].sort((a, b) => a.id.localeCompare(b.id));
    } else if (next === 'desc') {
      if (!originalRef.current) {
        originalRef.current = zoneFields;
      }
      sorted = [...fields].sort((a, b) => b.id.localeCompare(a.id));
    } else {
      sorted = originalRef.current ?? zoneFields;
      originalRef.current = null;
    }

    updateZoneFields(type, sorted);
  }

  const filteredFields = fields.filter((field) =>
    field.id.toLowerCase().includes(search.toLowerCase()),
  );

  const formSchema = z.object({
    fieldName: z
      .string()
      .min(2, {
        message: 'FiedName must be at least 2 characters.',
      })
      .max(50),
    expression: z.string().min(2, {
      message: 'Expression must be at least 2 characters.',
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fieldName: '',
      expression: '',
    },
    mode: 'onChange',
  });

  const { reset, handleSubmit, formState, control } = form;
  const { errors, isDirty, isValid } = formState;

  const [open, setOpen] = useState(false);

  // Keep track of dialog opening/closing
  const isButtonDisabled = !isDirty || !isValid;

  function handleDialogOpenChange(isOpen: boolean) {
    setOpen(isOpen);

    // If the dialog is closed (isOpen === false)
    if (!isOpen) {
      reset();
    }
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
    reset();
    setOpen(false);
  }

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[100px] flex flex-col h-full border overflow-hidden rounded transition-colors ${isOver ? 'bg-gray-100' : 'bg-white'}`}
    >
      <div className="sticky top-0 z-10 bg-white p-2 border-b">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold capitalize select-none">{type}</h3>

          {/* ----- create dialog form*/}
          {type === 'available' && (
            <Dialog open={open} onOpenChange={handleDialogOpenChange}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus />
                  New field
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add new field</DialogTitle>
                  <DialogDescription>
                    Create a new field. Click save when you are finished.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                      control={control}
                      name="fieldName"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="New field" {...field} />
                          </FormControl>
                          {errors.fieldName && (
                            <FormMessage>{errors.fieldName.message}</FormMessage>
                          )}
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="expression"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea placeholder="Expression" {...field} />
                          </FormControl>
                          {errors.expression && (
                            <FormMessage>{errors.expression.message}</FormMessage>
                          )}
                        </FormItem>
                      )}
                    />

                    <DialogFooter>
                      <Button variant="outline" disabled={isButtonDisabled}>
                        <Save />
                        Save
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}

          {fields.length !== 0 && fields.length !== 1 ? (
            <div className="flex gap-2 ml-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Field search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 text-sm"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={toggleSort}
                className={sortState === 'default' ? 'opacity-40' : 'text-accent-500'}
                disabled={fields.length === 0 || fields.length === 1}
              >
                {sortState === 'default' && <AArrowUp className="w-4 h-4" />}
                {sortState === 'asc' && <AArrowUp className="w-4 h-4" />}
                {sortState === 'desc' && <AArrowDown className="w-4 h-4" />}
              </Button>
            </div>
          ) : (
            ''
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2 ">
        {fields.length === 0 && (
          <div className="text-sm text-muted-foreground italic select-none">No fields</div>
        )}

        {search !== '' && filteredFields.length === 0 ? (
          <div className="text-sm text-muted-foreground italic select-none">Not found</div>
        ) : (
          <>
            {filteredFields.map((field) =>
              field.id === activeId ? null : <FieldItem key={field.id} field={field} zone={type} />,
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default FieldZone;
