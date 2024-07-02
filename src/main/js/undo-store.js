export default ({ dmx, axios, Vue }) => ({
  state: {
    changesStack: [] // Stack to store actions for undo functionality
  },

  mutations: {
    ADD_ACTION(state, action) {
      state.changesStack.push(action); // Push a new action to the stack
    },
    REMOVE_LAST_ACTION(state) {
      state.changesStack.pop(); // Remove the last action from the stack
    }
  },

  actions: {
    recordAction({ commit }, action) {
      commit('ADD_ACTION', action); // Commit the action to the state
    },
    async undoAction({ state, commit }) {
      const lastAction = state.changesStack.pop(); // Get the last action from the stack
      if (lastAction) {
        commit('REMOVE_LAST_ACTION'); // Remove the last action from the state
        try {
          switch (lastAction.type) {
            case 'createTopicmap':
              await dmx.rpc.deleteTopicmap(lastAction.payload.topicmapId); // Undo topicmap creation by deleting it
              break;
            case 'createTopic':
              await dmx.rpc.deleteTopic(lastAction.payload.topicId); // Undo topic creation by deleting it
              break;
            case 'updateAssociation':
              await dmx.rpc.updateAssoc({
                id: lastAction.payload.assocId,
                typeUri: lastAction.payload.oldTypeUri,
                role1TypeUri: lastAction.payload.oldRole1TypeUri,
                role2TypeUri: lastAction.payload.oldRole2TypeUri,
              }); // Revert association update
              break;
            case 'deleteAssociation':
              await dmx.rpc.createAssoc({
                typeUri: lastAction.payload.typeUri,
                role1: { topicId: lastAction.payload.role1Id, roleTypeUri: lastAction.payload.role1TypeUri },
                role2: { topicId: lastAction.payload.role2Id, roleTypeUri: lastAction.payload.role2TypeUri }
              }); // Recreate deleted association
              break;
            default:
              console.warn(`Unknown action type: ${lastAction.type}`); // Log if action type is unknown
          }
        } catch (error) {
          console.error(`Failed to undo action: ${error}`); // Log any errors
        }
      }
    }
  }
});
