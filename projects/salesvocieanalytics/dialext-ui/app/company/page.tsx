import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import companyData from '@/data/company.json';

export const metadata = {
  title: 'Параметры компании',
};

export default function CompanyPage() {
  const { company } = companyData;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Параметры компании</h1>

      <Tabs defaultValue="rules" className="w-full">
        <TabsList>
          <TabsTrigger value="rules">Правила оценки</TabsTrigger>
          <TabsTrigger value="qualification">Квалификация</TabsTrigger>
          <TabsTrigger value="tagging">Тегирование</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4 mt-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Название:</label>
          <div className="border p-2 rounded bg-white">{company.name}</div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Домен:</label>
          <div className="border p-2 rounded bg-white">{company.workspaceDomain}</div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Описание:</label>
          <div className="border p-3 rounded bg-white min-h-24 whitespace-pre-wrap text-sm">
            {company.description}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Модель:</label>
          <div className="border p-2 rounded bg-white">{company.model}</div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Версия движка:</label>
          <div className="border p-2 rounded bg-white">{company.engineVersion}</div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Классификация звонков:</label>
          <div className="border p-3 rounded bg-white min-h-32 whitespace-pre-wrap text-sm">
            {company.callQualification}
          </div>
        </div>

        <button className="bg-primary text-white px-6 py-2 rounded">
          Сохранить
        </button>
        </TabsContent>

        <TabsContent value="qualification" className="space-y-4 mt-6">
          <p className="text-body text-info">Правила квалификации звонков...</p>
        </TabsContent>

        <TabsContent value="tagging" className="space-y-4 mt-6">
          <p className="text-body text-info">Настройки автоматического тегирования...</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
