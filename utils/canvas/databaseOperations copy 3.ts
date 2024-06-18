import { createClient } from '@/utils/supabase/supabaseClient';
import { Tables, TablesInsert, TablesUpdate, Enums } from 'types_db';

// Fetch canvas data
export const fetchCanvas = async (canvasId: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('canvases')
    .select('id, name, description, content, nodes, edges')
    .eq('id', canvasId)
    .single();

  return { data, error };
};

// Insert a new node
export const createNode = async (node: Tables<'nodes'>) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('nodes')
    .insert(node)
    .select()
    .single();

  return { data, error };
};

// Update a node
export const updateNode = async (
  id: string,
  updates: TablesUpdate<'nodes'>
) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('nodes')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
};

// Delete a node
export const deleteNode = async (id: string) => {
  const supabase = createClient();
  const { error } = await supabase.from('nodes').delete().eq('id', id);
  return { error };
};

// Insert an edge
export const createEdge = async (edge: Tables<'edges'>) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('edges')
    .insert(edge)
    .select()
    .single();

  return { data, error };
};

// Update an edge
export const updateEdge = async (
  id: string,
  updates: TablesUpdate<'edges'>
) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('edges')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
};

// Delete an edge
export const deleteEdge = async (id: string) => {
  const supabase = createClient();
  const { error } = await supabase.from('edges').delete().eq('id', id);
  return { error };
};

// Save canvas state
export const saveCanvasState = async (
  canvasId: string,
  nodes: Tables<'nodes'>,
  edges: Tables<'edges'>
) => {
  const supabase = createClient();
  const { error } = await supabase
    .from('canvases')
    .update({ nodes, edges })
    .eq('id', canvasId);

  return { error };
};

// Attach a file to a node
export const attachFileToNode = async (nodeId: string, files: File[]) => {
  const supabase = createClient();
  const results = await Promise.all(
    files.map(async (file) => {
      const { data, error } = await supabase.storage
        .from('files')
        .upload(`node_${nodeId}/${file.name}`, file);
      if (error) {
        console.error('Error uploading file:', error);
        return { error };
      }
      const { data: fileData, error: fileError } = await supabase
        .from('files')
        .insert({
          name: file.name,
          file_type: file.type,
          file_data: data.path,
          file_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/files/${data.path}`
        })
        .select()
        .single();
      if (fileError) {
        console.error('Error inserting file:', fileError);
        return { error: fileError };
      }
      const { error: nodeFileError } = await supabase
        .from('node_files')
        .insert({ node_id: nodeId, file_id: fileData.id });
      if (nodeFileError) {
        console.error('Error associating file with node:', nodeFileError);
        return { error: nodeFileError };
      }
      return { data: fileData };
    })
  );

  const errors = results.filter((result) => result.error);
  return { error: errors.length > 0 ? errors : null };
};

// Remove a file from a node
export const removeFileFromNode = async (nodeId: string, fileId: number) => {
  const supabase = createClient();
  const { error: nodeFileError } = await supabase
    .from('node_files')
    .delete()
    .eq('node_id', nodeId)
    .eq('file_id', fileId);

  if (nodeFileError) {
    console.error('Error removing file from node:', nodeFileError);
    return { error: nodeFileError };
  }

  const { error: fileError } = await supabase
    .from('files')
    .delete()
    .eq('id', fileId);

  if (fileError) {
    console.error('Error deleting file:', fileError);
    return { error: fileError };
  }

  return { error: null };
};

// Attach a tag to a node
export const attachTagToNode = async (nodeId: string, tagId: number) => {
  const supabase = createClient();
  const { error } = await supabase
    .from('node_tags')
    .insert({ node_id: nodeId, tag_id: tagId });

  return { error };
};

// Remove a tag from a node
export const removeTagFromNode = async (nodeId: string, tagId: number) => {
  const supabase = createClient();
  const { error } = await supabase
    .from('node_tags')
    .delete()
    .eq('node_id', nodeId)
    .eq('tag_id', tagId);

  return { error };
};

// Get all tags
export const getTags = async () => {
  const supabase = createClient();
  const { data, error } = await supabase.from('tags').select('*');
  return { data, error };
};

// Create a new tag
export const createTag = async (tag: TablesInsert<'tags'>) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('tags')
    .insert(tag)
    .select()
    .single();
  return { data, error };
};

// Update a tag
export const updateTag = async (id: number, updates: TablesUpdate<'tags'>) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('tags')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
};

// Delete a tag
export const deleteTag = async (id: number) => {
  const supabase = createClient();
  const { error } = await supabase.from('tags').delete().eq('id', id);
  return { error };
};

// Get all node types
export const getNodeTypes = async () => {
  const supabase = createClient();
  const { data, error } = await supabase.from('node_types').select('*');
  return { data, error };
};

// Create a new node type
export const createNodeType = async (nodeType: TablesInsert<'node_types'>) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('node_types')
    .insert(nodeType)
    .select()
    .single();

  return { data, error };
};

// Update a node type
export const updateNodeType = async (
  id: number,
  updates: TablesUpdate<'node_types'>
) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('node_types')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
};

// Delete a node type
export const deleteNodeType = async (id: number) => {
  const supabase = createClient();
  const { error } = await supabase.from('node_types').delete().eq('id', id);
  return { error };
};

// Get all pricing plans
export const getPricingPlans = async () => {
  const supabase = createClient();
  const { data, error } = await supabase.from('prices').select('*');
  return { data, error };
};

// Create a new pricing plan
export const createPricingPlan = async (plan: TablesInsert<'prices'>) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('prices')
    .insert(plan)
    .select()
    .single();

  return { data, error };
};

// Update a pricing plan
export const updatePricingPlan = async (
  id: string,
  updates: TablesUpdate<'prices'>
) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('prices')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
};

// Delete a pricing plan
export const deletePricingPlan = async (id: string) => {
  const supabase = createClient();
  const { error } = await supabase.from('prices').delete().eq('id', id);
  return { error };
};

// Get all products
export const getProducts = async () => {
  const supabase = createClient();
  const { data, error } = await supabase.from('products').select('*');
  return { data, error };
};

// Create a new product
export const createProduct = async (product: TablesInsert<'products'>) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single();

  return { data, error };
};

// Update a product
export const updateProduct = async (
  id: string,
  updates: TablesUpdate<'products'>
) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
};

// Delete a product
export const deleteProduct = async (id: string) => {
  const supabase = createClient();
  const { error } = await supabase.from('products').delete().eq('id', id);
  return { error };
};

// Get all subscriptions
export const getSubscriptions = async () => {
  const supabase = createClient();
  const { data, error } = await supabase.from('subscriptions').select('*');
  return { data, error };
};

// Create a new subscription
export const createSubscription = async (
  subscription: TablesInsert<'subscriptions'>
) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('subscriptions')
    .insert(subscription)
    .select()
    .single();

  return { data, error };
};

// Update a subscription
export const updateSubscription = async (
  id: string,
  updates: TablesUpdate<'subscriptions'>
) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('subscriptions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
};

// Delete a subscription
export const deleteSubscription = async (id: string) => {
  const supabase = createClient();
  const { error } = await supabase.from('subscriptions').delete().eq('id', id);
  return { error };
};

// Get all users
export const getUsers = async () => {
  const supabase = createClient();
  const { data, error } = await supabase.from('users').select('*');
  return { data, error };
};

// Create a new user
export const createUser = async (user: TablesInsert<'users'>) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('users')
    .insert(user)
    .select()
    .single();

  return { data, error };
};

// Update a user
export const updateUser = async (
  id: string,
  updates: TablesUpdate<'users'>
) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
};

// Delete a user
export const deleteUser = async (id: string) => {
  const supabase = createClient();
  const { error } = await supabase.from('users').delete().eq('id', id);
  return { error };
};

// Get all workspaces
export const getWorkspaces = async () => {
  const supabase = createClient();
  const { data, error } = await supabase.from('workspaces').select('*');
  return { data, error };
};

// Create a new workspace
export const createWorkspace = async (
  workspace: TablesInsert<'workspaces'>
) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('workspaces')
    .insert(workspace)
    .select()
    .single();

  return { data, error };
};

// Update a workspace
export const updateWorkspace = async (
  id: string,
  updates: TablesUpdate<'workspaces'>
) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('workspaces')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
};

// Delete a workspace
export const deleteWorkspace = async (id: string) => {
  const supabase = createClient();
  const { error } = await supabase.from('workspaces').delete().eq('id', id);
  return { error };
};

// Get all workspace members
export const getWorkspaceMembers = async () => {
  const supabase = createClient();
  const { data, error } = await supabase.from('workspace_members').select('*');
  return { data, error };
};

// Create a new workspace member
export const createWorkspaceMember = async (
  member: TablesInsert<'workspace_members'>
) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('workspace_members')
    .insert(member)
    .select()
    .single();
  return { data, error };
};
// Update a workspace member
export const updateWorkspaceMember = async (
  id: string,
  updates: TablesUpdate<'workspace_members'>
) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('workspace_members')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};
// Delete a workspace member
export const deleteWorkspaceMember = async (id: string) => {
  const supabase = createClient();
  const { error } = await supabase
    .from('workspace_members')
    .delete()
    .eq('id', id);
  return { error };
};
// Get all projects
export const getProjects = async () => {
  const supabase = createClient();
  const { data, error } = await supabase.from('projects').select('*');
  return { data, error };
};
// Create a new project
export const createProject = async (project: TablesInsert<'projects'>) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select()
    .single();
  return { data, error };
};
// Update a project
export const updateProject = async (
  id: string,
  updates: TablesUpdate<'projects'>
) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};
// Delete a project
export const deleteProject = async (id: string) => {
  const supabase = createClient();
  const { error } = await supabase.from('projects').delete().eq('id', id);
  return { error };
};
// Get all insights
export const getInsights = async () => {
  const supabase = createClient();
  const { data, error } = await supabase.from('insights').select('*');
  return { data, error };
};
// Create a new insight
export const createInsight = async (insight: TablesInsert<'insights'>) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('insights')
    .insert(insight)
    .select()
    .single();
  return { data, error };
};
// Update an insight
export const updateInsight = async (
  id: string,
  updates: TablesUpdate<'insights'>
) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('insights')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};
// Delete an insight
export const deleteInsight = async (id: string) => {
  const supabase = createClient();
  const { error } = await supabase.from('insights').delete().eq('id', id);
  return { error };
};
// Get all customers
export const getCustomers = async () => {
  const supabase = createClient();
  const { data, error } = await supabase.from('customers').select('*');
  return { data, error };
};
// Create a new customer
export const createCustomer = async (customer: TablesInsert<'customers'>) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('customers')
    .insert(customer)
    .select()
    .single();
  return { data, error };
};
// Update a customer
export const updateCustomer = async (
  id: string,
  updates: TablesUpdate<'customers'>
) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('customers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};
// Delete a customer
export const deleteCustomer = async (id: string) => {
  const supabase = createClient();
  const { error } = await supabase.from('customers').delete().eq('id', id);
  return { error };
};
// Get all profiles
export const getProfiles = async () => {
  const supabase = createClient();
  const { data, error } = await supabase.from('profiles').select('*');
  return { data, error };
};
// Create a new profile
export const createProfile = async (profile: TablesInsert<'profiles'>) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .insert(profile)
    .select()
    .single();
  return { data, error };
};
// Update a profile
export const updateProfile = async (
  id: string,
  updates: TablesUpdate<'profiles'>
) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};
// Delete a profile
export const deleteProfile = async (id: string) => {
  const supabase = createClient();
  const { error } = await supabase.from('profiles').delete().eq('id', id);
  return { error };
};
