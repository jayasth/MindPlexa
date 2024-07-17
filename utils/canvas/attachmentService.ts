import { createClient } from '@/utils/supabase/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient();

export interface Attachment {
  id: string;
  node_id: string;
  type: 'file' | 'url';
  file_name: string | null;
  file_size: number | null;
  storage_path: string | null;
  mime_type: string | null;
  url: string | null;
  is_file: boolean;
  created_at: string | null;
}

export const addAttachment = async (
  nodeId: string,
  attachment: { type: 'file' | 'url'; content: File | string }
): Promise<Attachment | null> => {
  if (attachment.type === 'file' && attachment.content instanceof File) {
    const file = attachment.content;
    const filePath = `node-attachments/${nodeId}/${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('node-attachments')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return null;
    }

    const { data, error: insertError } = await supabase
      .from('node_attachments')
      .insert({
        id: uuidv4(),
        node_id: nodeId,
        type: 'file' as 'file',
        file_name: file.name,
        file_size: file.size,
        storage_path: filePath,
        mime_type: file.type,
        is_file: true
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting file attachment:', insertError);
      return null;
    }

    return data as Attachment;
  } else if (attachment.type === 'url') {
    const { data, error: insertError } = await supabase
      .from('node_attachments')
      .insert({
        id: uuidv4(),
        node_id: nodeId,
        type: 'url' as 'url',
        url: attachment.content as string,
        is_file: false
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting URL attachment:', insertError);
      return null;
    }

    return data as Attachment;
  }

  return null;
};

export const removeAttachment = async (
  attachmentId: string
): Promise<boolean> => {
  const { data: attachment, error: fetchError } = await supabase
    .from('node_attachments')
    .select('*')
    .eq('id', attachmentId)
    .single();

  if (fetchError) {
    console.error('Error fetching attachment:', fetchError);
    return false;
  }

  if (attachment.is_file && attachment.storage_path) {
    const { error: deleteStorageError } = await supabase.storage
      .from('node-attachments')
      .remove([attachment.storage_path]);

    if (deleteStorageError) {
      console.error('Error deleting file from storage:', deleteStorageError);
      return false;
    }
  }

  const { error: deleteError } = await supabase
    .from('node_attachments')
    .delete()
    .eq('id', attachmentId);

  if (deleteError) {
    console.error('Error deleting attachment:', deleteError);
    return false;
  }

  return true;
};

export const getAttachments = async (nodeId: string): Promise<Attachment[]> => {
  const { data, error } = await supabase
    .from('node_attachments')
    .select('*')
    .eq('node_id', nodeId);

  if (error) {
    console.error('Error fetching attachments:', error);
    return [];
  }

  return data as Attachment[];
};

export const handleAttachmentPreview = async (attachment: Attachment) => {
  const previewId = `preview-${attachment.id}`;
  let previewWindow = document.getElementById(previewId);

  if (previewWindow) {
    document.body.removeChild(previewWindow);
  }

  previewWindow = document.createElement('div');
  previewWindow.id = previewId;
  previewWindow.style.position = 'fixed';
  previewWindow.style.maxWidth = '300px';
  previewWindow.style.maxHeight = '200px';
  previewWindow.style.backgroundColor = 'white';
  previewWindow.style.border = '1px solid #ccc';
  previewWindow.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
  previewWindow.style.zIndex = '1000';
  previewWindow.style.overflow = 'auto';
  previewWindow.className = 'file-preview';

  const handleMouseMove = (event: MouseEvent) => {
    const { clientX, clientY } = event;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const previewWidth = previewWindow.offsetWidth;
    const previewHeight = previewWindow.offsetHeight;

    const left = Math.min(clientX + 20, windowWidth - previewWidth - 20);
    const top = Math.min(clientY + 20, windowHeight - previewHeight - 20);

    previewWindow.style.left = `${left}px`;
    previewWindow.style.top = `${top}px`;
  };

  document.addEventListener('mousemove', handleMouseMove);

  if (attachment.type === 'url') {
    const iframe = document.createElement('iframe');
    iframe.src = attachment.url || '';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    previewWindow.appendChild(iframe);
  } else if (attachment.type === 'file' && attachment.storage_path) {
    try {
      const { data, error } = await supabase.storage
        .from('node-attachments')
        .download(attachment.storage_path);

      if (error) throw error;

      const blob = new Blob([data], { type: attachment.mime_type || '' });
      const fileURL = URL.createObjectURL(blob);

      if (attachment.mime_type?.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = fileURL;
        img.style.maxWidth = '100%';
        img.style.maxHeight = '100%';
        img.style.objectFit = 'contain';
        previewWindow.appendChild(img);
      } else if (attachment.mime_type === 'application/pdf') {
        const iframe = document.createElement('iframe');
        iframe.src = fileURL;
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        previewWindow.appendChild(iframe);
      } else {
        const textContainer = document.createElement('div');
        textContainer.textContent = `File: ${attachment.file_name}`;
        previewWindow.appendChild(textContainer);
      }
    } catch (error) {
      console.error('Error loading file:', error);
      const errorMessage = document.createElement('div');
      errorMessage.textContent = 'Error loading file';
      previewWindow.appendChild(errorMessage);
    }
  }

  document.body.appendChild(previewWindow);

  return () => {
    document.removeEventListener('mousemove', handleMouseMove);
    if (previewWindow && document.body.contains(previewWindow)) {
      document.body.removeChild(previewWindow);
    }
  };
};

export const removeAllPreviews = () => {
  const previews = document.querySelectorAll('.file-preview');
  previews.forEach((preview) => {
    if (document.body.contains(preview)) {
      document.body.removeChild(preview);
    }
  });
};

export const downloadAttachment = async (
  attachment: Attachment
): Promise<void> => {
  if (attachment.type === 'file' && attachment.storage_path) {
    const { data, error } = await supabase.storage
      .from('node-attachments')
      .download(attachment.storage_path);

    if (error) {
      console.error('Error downloading file:', error);
      return;
    }

    const blob = new Blob([data], { type: attachment.mime_type || '' });
    const fileURL = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = fileURL;
    link.download = attachment.file_name || '';
    link.click();
  }
};
