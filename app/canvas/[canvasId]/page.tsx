import { createClient } from '@/utils/supabase/supabaseServer';
import { redirect } from 'next/navigation';
import CanvasToolbar from './_components/CanvasToolbar';
import DraggableNode from './_components/DraggableNode';
import { Tables } from '@/types_db';

type Canvas = Tables<'canvases'>;

export default async function CanvasPage({
  params
}: {
  params: { canvasId: string };
}) {
  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/signin');
  }

  const { data: canvas, error } = await supabase
    .from('canvases')
    .select('*')
    .eq('id', params.canvasId)
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.log(error);
    return <div>Error loading canvas</div>;
  }

  return (
    <div className="max-w-6xl px-4 py-8 mx-auto sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold">{canvas.name}</h1>
      <CanvasToolbar canvasId={params.canvasId} />
      {/* Add your canvas content */}
      <DraggableNode />
    </div>
  );
}
