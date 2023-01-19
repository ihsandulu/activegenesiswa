Dokumentasi Whatsapp Api
Pengguna Ajax:
----------------------

Gunakan ajax untuk mengirim pesan, seperti dibawah ini:

$.ajax({
   url: "https://demowanotif.activgenesis.com/api/token",
   method: "GET",
   data: {'email': 'email anda', 'password': 'password anda'}
})
.done(function(data){
      let token = data. Token;
      $.ajax({
      url: "https://demowanotif.activgenesis.com:8000/send-message",
      method: "GET",
      data: {'email': 'email anda', 'token': token, 'id':'nama server/layanan', 'message':'Isi pesan anda', 'number':'08xxxxxxx'}
   });
});
 
 
===========================================================================================================
 
Pengguna Jquery:
-------------------------

function kirimpesan(message,number,server){
        setTimeout(() => {
            $.get("https://demowanotif.activgenesis.com/api/token",{email:'email@anda.com',password:'xxxxxxxx'})
            .done(function(data){
                let token = data.token;
                $.get("https://demowanotif.activgenesis.com:8000/send-message",{email:'email@anda.com','token': token, message:message, number:number,id:server})
                .done(function(data){  
                   
                });
            });
        }, 1000);          
    }
 
 
===========================================================================================================
 
Pengguna Laravel:
-----------------

 $urltoken="https://demowanotif.activgenesis.com/api/token?email=email@anda.com&password=xxxxxxxx";    
            $response = Http::get($urltoken);
            $token =  $response["token"];

            $urlpesan="https://demowanotif.activgenesis.com:8000/send-message?email=email@anda.com&token=".$token."&id=server&number=08xxxxxxxxxx&message=Isi pesan";
            $response = Http::get($urlpesan);


===========================================================================================================
 
Pengguna CI4:
-------------

$uri = "https://demowanotif.activgenesis.com/api/token?email=email@anda.com&password=xxxxxxxxx";
        $user = json_decode(
            file_get_contents($uri )
        );                    
        $token=$user->token;
        $pesan="isi pesan";
        $urimessage = "https://demowanotif.activgenesis.com:8000/send-message?email=email@anda.com&token=".$token."&id=nama_server_anda&message=".urlencode($pesan)."&number=08xxxxxxxxx";
        // echo $uri;die;
        $uripesan=file_get_contents($urimessage);