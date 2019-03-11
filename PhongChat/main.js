const socket = io('http://localhost:6000/')

var peer = new Peer({ key: 'lwjd5qra8257b9' }); // tạo ra 1 peer key mới

peer.on('open', id => {

    // console.log(id);
    $("#my-peer").append(id);
    
    $("#btnid").on('click',function(){
        var conn = peer.connect($('#idnhan').val());
        conn.on('open', function() {
            console.log(conn.peer);
            // Receive messages
            conn.on('data', function(data) {
              console.log('Received', data);
            });
            // Send messages
            conn.send('Hello1!');
    
        });
    });



    peer.on('connection',function(conn){
        conn.on('open', function() {
            console.log(conn.peer);
            // Receive messages
            conn.on('data', function(data) {
              console.log('Received', data);
            });
          
            // Send messages
            
            conn.send('Received', data);

        });
        var call = peer.call('dest-peer-id',mediaStream);
    });
    $("#btnbatdau").on('click',function(){

        openStream().then(stream => {
             playStream('video1', stream);
             const call = peer.call($('#idnhan').val(), stream);
             call.on('stream', stream => {       
                 console.log(stream.getVideoTracks());        
                 playStream('video2',stream);
             }); // Máy nhận
            
            call.on('stream', function(stream2) {
                // `stream` is the MediaStream of the remote peer.
                // Here you'd add it to an HTML video/canvas element.
                console.log('bắt đầu stream');
                $("#btndung").on('click',function(){
                    // stream.getVideoTracks()[0].play();
                    stream.getVideoTracks()[0].stop();
                });
            });
            socket.emit('dungstream',stream);
         }); 
         
    });
    
    peer.on('call', function(call) {
        

        openStream().then(stream => {
            call.answer(stream);             
            playStream('video1', stream);
            call.on('stream', remoteStream => {                
                playStream('video2',remoteStream);        
            });           
            $("#btndung").on('click',function(){
                stream.getVideoTracks()[0].stop();
                socket.on('truyenlai',stream2 => {
                    console.log('truyen lai');
                });
            });
            $("#btngoi").on('click',function(){
                // stream.getVideoTracks()[0].play();
                
            });
            
        });
        
    });

 
});

function openStream(){
    const config = {
        "audio": false,
        "video": true
    };
    return navigator.mediaDevices.getUserMedia(config);
}

function playStream(idVideoTag, stream){
    const video = document.getElementById(idVideoTag);
    video.srcObject = stream;
    video.play();
}
