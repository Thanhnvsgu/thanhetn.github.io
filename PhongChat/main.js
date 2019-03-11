const socket = io('http://localhost:5000/')

socket.on('Online_user', e =>{
    document.getElementById('online_user').innerHTML=`Số lượng người online: ${e}`;
});
socket.on('List_online', list =>{
    for(var i = 0 ; i < list.length;i++ ){
        $("#list_ul").append(`<li id="li_${list[i].id}" class="list-group-item">
                                <div class="checkbox">
                                    <label><input type="checkbox" class="userid" value="${list[i].id}">${list[i].name}</label>
                                </div>
                            </li>`);
    };
});

socket.on('Turn_off', user =>{
    alert(user.id);
    $(`#li_${user.id}`).remove();
    $.notify(`${user.id} đã offline`);
});

var peer = new Peer({ key: 'lwjd5qra8257b9' }); // tạo ra 1 peer key mới

peer.on('open', id => {

    // console.log(id);
    $("#my-peer").append(id);
    
    $("#btnsignup").on('click',function(){
        console.log($("#chatname").val());
        var user = {};
        user.name = $("#chatname").val();
        user.id = id;
        socket.emit('Sign_up', user);
    });
    socket.on('Signup_Success', e=>{
        if(e == 1){
            $.notify("Đăng ký tài khoản thành công!","success");
            $("#notification").show();
            $("#signup").hide();
        }else{
            $.notify("Tên người dùng đã tồn tại!");
        }
    });
    socket.on('Hello_user', e=>{
        document.getElementById('hello_user').innerHTML = `Xin chào, ${e}`;
        document.getElementById('btnlist').disabled = false;
    });
    socket.on('Update_list', user => {
        $("#list_ul").append(`<li id="li_${user.id}" class="list-group-item">
                                <div class="checkbox">
                                    <label><input type="checkbox" class="userid" value="${user.id}">${user.name}</label>
                                </div>
                            </li>`);
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
