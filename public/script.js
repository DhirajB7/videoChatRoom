const socket = io("/");
const videoGrid = document.getElementById("video-grid");
// const myPeer = new Peer(undefined, {
//   host: "/",
//   port: "4001",
// });

const myPeer = new Peer({
  config: {'iceServers': [
  //  { url: 'stun.l.google.com:19302' },
    { url: 'turn:turn.bistri.com:80', username: 'homeo', credential: 'homeo'}
  ]} /* Sample servers, please use appropriate ones */
});

const peers = {};

const myVideo = document.createElement("video");
myVideo.muted = true;

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    addVideoStream(myVideo, stream);

    myPeer.on("call", (call) => {
      call.answer(stream); // 2ed user  to 1st user screen

      //1st user to 2ed user
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
  });

myPeer.on("open", (id) => {
  socket.emit("join", ROOM_ID, id);
});

socket.on("user-disconnected", (userId) => {
  if (peers[userId]) {
    peers[userId].close();
  }
});

//add call to video grid
const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
};

// make call when new users join
const connectToNewUser = (userId, stream) => {
  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");

  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });

  call.on("close", () => {
    video.remove();
  });

  peers[userId] = call;
};
