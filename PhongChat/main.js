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
    console.log(user);
    $(`#li_${user.id}`).remove(); 
    $.notify(`${user.name} đã offline`);
});

var peer = new Peer({ key: 'lwjd5qra8257b9' }); // tạo ra 1 peer key mới

peer.on('open', id => {
    $("#videochat").append(`<div class="col-lg-6 id="div_${id}">                             
                                <div> <video class="col-lg-12" controls poster="https://cdn2.vectorstock.com/i/1000x1000/81/96/france-flag-vector-20178196.jpg" id="video_${id}"> </video> </div> 
                                <div id="user_video" style="text-align:center;color:#3399ff;font-weight:bold"> </div>
                            </div>`);
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
            $("#chatarea").show();
        }else{
            $.notify("Tên người dùng đã tồn tại!");
        }
    });
    socket.on('Hello_user', e=>{
        document.getElementById('user_video').innerHTML = e;
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

    socket.on('New_user', user =>{
        $.notify(`${user.name} đang online`,'success');
    });
    socket.on('connect_end', e=>{
        alert(e);
        $(`#div_${e}`).remove();
    });

    $("#btncall").on('click',function(){
        
        openStream().then(stream => {
            var list = document.getElementsByClassName('userid');
            playStream(`video_${id}`, stream);
            var call = [];
            for(var i=0;i < list.length;i++){
                    var ten = list[i].value;
                    // console.log(ten);                    
                    if(list[i].checked == true){             
                        // console.log(list[i].value);                      
                        $("#videochat").append(`<div class="col-lg-3" id="div_${ten}">                             
                        <div> <video class="col-lg-12" controls poster="https://cdn1.vectorstock.com/i/1000x1000/44/90/italy-flag-on-a-white-vector-21844490.jpg" id="video_${ten}"> </video> </div> 
                        <div id="user_video" style="text-align:center;color:#3399ff;font-weight:bold"> ${document.getElementById(`li_${ten}`).textContent} </div>
                    </div>`);
                        call.push(peer.call(`${ten}` , stream));                       
                    }
            };
            console.log(call.length);
            call.forEach(t => {
                console.log(t)  ;            
                t.on('stream',stream => {
                    playStream(`video_${t.peer}`,stream);
                    alert("dang stream");
                });
            });
            $("#btncam_off").on('click',function(){
                stream.getVideoTracks()[0].stop();
                stream.getAudioTracks()[0].stop();
            });
         }); 
         
    });
    
    peer.on('call', function(call) {
        // alert("co nguoi goi");
        // console.log(call);
        $("#videochat").append(`<div class="col-lg-3" id = "div_${call.peer}">                             
        <div> <video class="col-lg-12" controls poster="https://cdn1.vectorstock.com/i/1000x1000/44/90/italy-flag-on-a-white-vector-21844490.jpg" id="video_${call.peer}"> </video> </div> 
        <div id="user_video" style="text-align:center;color:#3399ff;font-weight:bold"> ${document.getElementById(`li_${call.peer}`).textContent} </div>
    </div>`);
        openStream().then(stream => {
            call.answer(stream);             
            playStream(`video_${id}`, stream);
            call.on('stream', remoteStream => {                
                playStream(`video_${call.peer}`,remoteStream);               
                $("#btncam_off").on('click',function(){
                    if(stream.getVideoTracks().length>0) stream.getVideoTracks()[0].stop();
                    if(stream.getAudioTracks().length> 0 ) stream.getAudioTracks()[0].stop();
                    console.log(`div_${call.peer}`);
                    $(`#div_${call.peer}`).remove();
                    socket.emit('close_connect',id);
                });     
            });           
        });
    });

    $("#btnsend").on('click',function(){
        socket.emit('data_chat', { data:document.getElementById('text_send').value,id:id });
    });
    socket.on('data_receive', e =>{
        $("#chat_data").append(`<b>${e.ten}:</b> ${e.data} </br>`);
    });

    // var res;
    // $("#btnuse").on('click',function(){
    //     openStream().then(stream => {
    //         alert('a');
    //         playStream(`video_${id}`,stream);
    //         $("#btnoff").on('click',function(){
    //             stream.getTracks()[0].stop();
    //             stream.getVideoTracks()[0].stop();
    //         });           
    //     });
    // });
    

 
});

function openStream()  {
    const config = {
        video:true,
        audio:false
    }
    return navigator.mediaDevices.getUserMedia(config);
} 

function playStream(idVideoTag, stream){
    const video = document.getElementById(idVideoTag);
    video.srcObject = stream;
    video.play();
}

