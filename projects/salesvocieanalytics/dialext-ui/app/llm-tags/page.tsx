import tagsData from '@/data/llm-tags.json';

export const metadata = {
  title: 'LLM теги',
};

export default function LLMTagsPage() {
  const { tags } = tagsData;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">LLM теги</h1>

      <div className="space-y-4">
        {tags.map((tag) => (
          <div key={tag.name} className="border p-4 rounded">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold">{tag.nameRu}</h3>
              <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                {tag.priority}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">{tag.description}</p>
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked={tag.active} />
                <span>Активен</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked={tag.showInStats} />
                <span>Показывать в статистике</span>
              </label>
            </div>
          </div>
        ))}
      </div>

      <button className="bg-primary text-white px-6 py-2 rounded">
        Сохранить
      </button>
    </div>
  );
}
