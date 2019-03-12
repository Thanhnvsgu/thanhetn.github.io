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
    $("#videochat").append(`<video class="col-lg-6" id="video_${id}"> </video>`);
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
                        $("#videochat").append(`<video class="col-lg-3" id="video_${ten}"> </video>`);
                        call.push(peer.call(`${ten}` , stream));
                        
                    }
            };
            
            call.forEach(e => {
                console.log(e);
                e.on('stream',stream =>{
                    playStream(`video_${e.peer}`,stream);
                });
            });
             
           
            // socket.emit('dungstream',stream);
         }); 
         
    });
    
    peer.on('call', function(call) {
        // alert("co nguoi goi");
        // console.log(call);
        $("#videochat").append(`<video class="col-lg-3" id="video_${call.peer}"> </video>`);
        openStream().then(stream => {
            call.answer(stream);             
            playStream(`video_${id}`, stream);
            call.on('stream', remoteStream => {                
                playStream(`video_${call.peer}`,remoteStream);        
            });           
        });
        
    });

 
});

function openStream(){
    const config = {
        "audio": false,
        "video": {
            "frameRate": {
                "min": "30",
                "max": "60"
            }
        }
    };
    return navigator.mediaDevices.getUserMedia(config);
}

function playStream(idVideoTag, stream){
    const video = document.getElementById(idVideoTag);
    video.srcObject = stream;
    video.play();
}
