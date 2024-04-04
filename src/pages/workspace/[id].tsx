// /pages/workspace/[id].tsx
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { fetchWorkspace } from "../../features/Workspace/workspaceSlice";
import Workspace from "../../components/Workspace/Workspace";
import withAuth from "../../components/withAuth";

const WorkspacePage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useDispatch();

  useEffect(() => {
    if (id) {
      dispatch(fetchWorkspace(id as string));
    }
  }, [id, dispatch]);

  return <Workspace />;
};

export default withAuth(WorkspacePage);
