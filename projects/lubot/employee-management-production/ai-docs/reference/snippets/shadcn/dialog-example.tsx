import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function DismissEmployeeDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Уволить сотрудника</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Подтвердите увольнение</DialogTitle>
          <DialogDescription>
            Сотрудник потеряет доступ к системе. Действие можно отменить в течение 7 дней.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="ghost">
            Отмена
          </Button>
          <Button type="button" className="bg-red-600 text-white">
            Уволить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
