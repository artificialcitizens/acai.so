import PouchDB from 'pouchdb-browser';
import { Workspace } from '../state';

const db = new PouchDB('workspaces');

export const saveWorkspace = async (workspace: Workspace) => {
  try {
    // Check if the workspace already exists
    const existingWorkspace = await db.get(workspace.id);

    // If it exists, update it
    await db.put({
      ...workspace,
      _id: workspace.id,
      _rev: existingWorkspace._rev, // Include the revision to update the doc
    });
  } catch (err: any) {
    if (err.name === 'not_found') {
      // If the workspace doesn't exist, create it
      await db.put({
        ...workspace,
        _id: workspace.id,
      });
    } else {
      // Handle any other errors
      console.error('Error saving workspace:', err);
    }
  }
};
