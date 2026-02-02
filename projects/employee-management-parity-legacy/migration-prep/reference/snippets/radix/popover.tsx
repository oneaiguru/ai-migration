import * as Popover from "@radix-ui/react-popover";

export function EmployeePopover() {
  return (
    <Popover.Root>
      <Popover.Trigger className="rounded border px-3 py-1 text-sm">
        Подробнее
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="max-w-xs rounded border bg-white p-3 text-sm shadow-xl"
          sideOffset={8}
        >
          <strong>График:</strong> 2/2, смена 10:00–19:00
          <br />
          <strong>Теги:</strong> night-shift, mentor
          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
