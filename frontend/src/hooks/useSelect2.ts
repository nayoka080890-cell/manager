import { useEffect, useRef } from 'react';
import $ from 'jquery';

type UseSelect2Options = {
  placeholder: string;
  value: string;
  onValueChange: (value: string) => void;
  syncDeps?: readonly unknown[];
};

export const useSelect2 = ({ placeholder, value, onValueChange, syncDeps = [] }: UseSelect2Options) => {
  const selectRef = useRef<HTMLSelectElement | null>(null);

  useEffect(() => {
    if (!selectRef.current) return;

    let select: JQuery<HTMLElement> | null = null;
    let initialized = false;

    const initSelect2 = async () => {
      try {
        const win = window as Window & { jQuery?: typeof $; $?: typeof $ };
        win.jQuery = $;
        win.$ = $;

        const select2Module = await import('select2/dist/js/select2.full.min.js');
        const select2Factory = (select2Module as unknown as { default?: (root: Window, jQuery: typeof $) => void }).default;

        if (typeof ($.fn as { select2?: unknown }).select2 !== 'function' && typeof select2Factory === 'function') {
          select2Factory(window, $);
        }

        if (!selectRef.current) return;

        select = $(selectRef.current);
        if (typeof (select as any).select2 !== 'function') {
          console.error('Select2 is loaded but not attached to jQuery.');
          return;
        }

        (select as any).select2({
          placeholder,
          width: '100%',
          allowClear: true,
          minimumResultsForSearch: 0,
        });

        select.on('change', () => {
          const nextValue = select?.val() as string | null;
          onValueChange(nextValue ?? '');
        });

        select.on('select2:open', () => {
          const searchInput = document.querySelector('.select2-container--open .select2-search__field') as HTMLInputElement | null;
          searchInput?.focus();
        });

        initialized = true;
      } catch (error) {
        console.error('Select2 initialization failed:', error);
      }
    };

    void initSelect2();

    return () => {
      if (!select) return;

      select.off('change');
      select.off('select2:open');

      if (initialized && typeof (select as any).select2 === 'function') {
        (select as any).select2('destroy');
      }
    };
  }, [onValueChange, placeholder]);

  useEffect(() => {
    if (!selectRef.current) return;
    $(selectRef.current).val(value).trigger('change.select2');
  }, [value, ...syncDeps]);

  return selectRef;
};
