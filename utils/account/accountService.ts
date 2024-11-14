import { createClient } from '@/utils/supabase/supabaseClient';
import { removeAllAttachmentsForUser } from '@/utils/canvas/attachmentService';
import { removeAllDrawingsForUser } from '@/utils/canvas/drawNodeService';
import { removeAllFeedbackImagesForUser } from '@/components/FeedbackButton/FeedbackModal';

export const deleteUserAccount = async () => {
  const supabase = createClient();

  try {
    const {
      data: { user }
    } = await supabase.auth.getUser();
    const userId = user?.id;

    if (!userId) throw new Error('User not authenticated');

    // Remove all related storage files
    await removeAllAttachmentsForUser(userId);
    await removeAllDrawingsForUser(userId);
    await removeAllFeedbackImagesForUser(userId);

    // Call the RPC to delete user data
    const { data, error: rpcError } = await supabase.rpc('delete_user_account');

    if (rpcError) {
      console.error('RPC Error:', rpcError);
      throw rpcError;
    }

    if (!data) {
      throw new Error('Failed to delete account data');
    }

    // Sign out after successful deletion
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      console.error('Sign Out Error:', signOutError);
      throw signOutError;
    }

    return { success: true };
  } catch (error) {
    console.error('Delete Account Error:', error);
    throw error;
  }
};
