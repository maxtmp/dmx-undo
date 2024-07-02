export default ({ store, dmx, axios, Vue }) => ({
  storeModule: {
      name: 'undo',
      module: require('./undo-store').default
  },
  components: [{
      comp: require('./components/UndoButton').default,
      mount: 'toolbar-left'
  }],
  init() {
      console.log('Undo plugin init started');
      store.watch(
          (state) => state.topicmaps.topicmap,
          (newTopicmap, oldTopicmap) => {
              console.log('Watching topicmap change');
              if (newTopicmap !== oldTopicmap) {
                  console.log('Recording createTopicmap action', newTopicmap.id);
                  store.dispatch('undo/recordAction', {
                      type: 'createTopicmap',
                      payload: { topicmapId: newTopicmap.id }
                  });
              }
          }
      );
      store.watch(
          (state) => state.topicmaps.topics,
          (newTopics, oldTopics) => {
              console.log('Watching topics change');
              const newTopicIds = newTopics.map(t => t.id);
              const oldTopicIds = oldTopics.map(t => t.id);
              const createdTopics = newTopics.filter(t => !oldTopicIds.includes(t.id));
              createdTopics.forEach(topic => {
                  console.log('Recording createTopic action', topic.id);
                  store.dispatch('undo/recordAction', {
                      type: 'createTopic',
                      payload: { topicId: topic.id }
                  });
              });
          },
          { deep: true }
      );
      store.watch(
          (state) => state.topicmaps.assocs,
          (newAssocs, oldAssocs) => {
              console.log('Watching associations change');
              const newAssocIds = newAssocs.map(a => a.id);
              const oldAssocIds = oldAssocs.map(a => a.id);
              const createdAssocs = newAssocs.filter(a => !oldAssocIds.includes(a.id));
              const deletedAssocs = oldAssocs.filter(a => !newAssocIds.includes(a.id));
              createdAssocs.forEach(assoc => {
                  console.log('Recording createAssociation action', assoc.id);
                  store.dispatch('undo/recordAction', {
                      type: 'createAssociation',
                      payload: { assocId: assoc.id }
                  });
              });
              deletedAssocs.forEach(assoc => {
                  console.log('Recording deleteAssociation action', assoc.id);
                  store.dispatch('undo/recordAction', {
                      type: 'deleteAssociation',
                      payload: { assocId: assoc.id }
                  });
              });
          },
          { deep: true }
      );
      console.log('Undo plugin init completed');
  }
});
