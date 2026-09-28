import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export default async function TodosPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: todos } = await supabase.from("todos").select();

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">Supabase Connection Test (Todos)</h1>
      <ul className="list-disc pl-5 space-y-1">
        {todos && todos.length > 0 ? (
          todos.map((todo: { id: string | number; name?: string; title?: string }) => (
            <li key={todo.id}>{todo.name || todo.title || JSON.stringify(todo)}</li>
          ))
        ) : (
          <li className="text-slate-500">No todos found or &apos;todos&apos; table not created yet.</li>
        )}
      </ul>
    </div>
  );
}
