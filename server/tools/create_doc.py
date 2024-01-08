def create_doc(socket):
  # Create the Crew object
  socket.emit("create_doc", {
    "id": "create_doc",
  })
  