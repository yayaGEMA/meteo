// Fonction permettant d'appliquer un overlay avec une icône de chargement sur toute la page
function setOverlay(){
    $('body').append(`
        <div class="overlay"><img src="img/ajax-loader.svg"></div>
    `);
}

// Fonction permettant de supprimer l'overlay appliqué par la fonction précédente
function removeOverlay(){
    $('.overlay').remove();
}

// Fonction permettant d'échapper le HTML
function escapeHtml(text) {
    var map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };

    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}


// Si le bouton est cliqué
$('button').click(function(){

    // Supprimer les messages déjà chargés
    $('.todaysWeather').remove();
    $('.forecast').remove();

    // Options de la geolocalisation
    let options = {
        enableHighAccuracy: true,       // Activation de la haute précision
        timeout: 5000,                  // Temps en ms avant timeout
        maximumAge: 0                   // Desactive le cache gps
    }

    // Fonction qui sera appelée si la localisation n'a pas pu être récupérée (e.code contient le code de l'erreur)
    let error = function(e){
        if(e.code == e.TIMEOUT){
            $('button').after('<p class="red">Temps expiré</p>');
        } else if(e.code == e.PERMISSION_DENIED){
            $('button').after('<p class="red">Vous avez refusé le geolocalisation</p>');
        } else if(e.code == e.POSITION_UNAVAILABLE){
            $('button').after('<p class="red">Localisation impossible</p>');
        } else {
            $('button').after('<p class="red">Problème inconnu</p>');
        }
    }

    // Fonction qui sera appelée si la localisation a reussi (p contient les coordonnées de localisation)
    let success = function(p){

        let latitude = p.coords.latitude;
        let longitude = p.coords.longitude;

        $('button').after('<div class="todaysWeather"></div>')
        $('.todaysWeather').prepend('<h2>Météo actuelle à votre position :</h2>');

        $.ajax({
            type: 'GET',
            url: 'https://www.prevision-meteo.ch/services/json/lat='+latitude+'lng='+longitude,
            dataType:'json',
            success: function(data){

                // Conditions actuelles avec image
                $('.todaysWeather').append('<p>'+ escapeHtml(data.current_condition['condition'])+'<img src='+ escapeHtml(data.current_condition["icon"])+'></img></p>');
                // Lever et coucher de soleil
                $('.todaysWeather').append('<p>Lever du soleil : '+ escapeHtml(data.city_info['sunrise'])+' / Coucher de soleil : '+ escapeHtml(data.city_info['sunset']) +'</p>');
                // Température
                $('.todaysWeather').append('<p>Température : ' + escapeHtml(data.current_condition['tmp'].toString())+ '°C</p>');
                // Humidité
                $('.todaysWeather').append('<p>Humidité : '+ escapeHtml(data.current_condition['humidity'].toString()) + ' %</p>');
                // Vent et direction
                $('.todaysWeather').append('<p>Vent : ' + escapeHtml(data.current_condition['wnd_spd'].toString()) + ' km/h, direction ' + escapeHtml(data.current_condition['wnd_dir']) + '</p>');
                // Pression barométrique
                $('.todaysWeather').append('<p>Pression barométrique : ' + escapeHtml(data.current_condition['pressure'].toString()) + ' hPa</p>');

                // Prévisions des prochains jours
                $('.todaysWeather').after('<div class="forecast"></div>');

                // On crée une boucle pour chaque jour prévisionnel
                for (let i=0;i<4; i++){
                    // Création d'une div parent
                    $('.forecast').append('<div class="day'+(i+1)+'"></div>');
                    // Date
                    $('.day'+(i+1)).append('<h3>' + escapeHtml(data["fcst_day_"+(i+1)]['day_long'].toString()) + ' ' + escapeHtml(data["fcst_day_"+(i+1)]['date'].toString()) + '</h3>');
                    // Conditions prévisionnelles avec image
                    $('.day'+(i+1)).append('<p>'+ escapeHtml(data["fcst_day_"+(i+1)]['condition'].toString()) + '<img src='+ escapeHtml(data["fcst_day_"+(i+1)]["icon"].toString())+'></img></p>');
                    // Températures minimum et maximum
                    $('.day'+(i+1)).append('<p>Températures : de '+ escapeHtml(data["fcst_day_"+(i+1)]['tmin'].toString()) + '°C à '+ escapeHtml(data["fcst_day_"+(i+1)]['tmax'].toString())+'°C</p>');
                }

                $('.forecast').children().css({
                    'border': '1px solid black',
                    'padding': '20px',
                    'width': '100%'
                });
            }, error : function(){
                $('button').after('<p class="red">Erreur lors de la récupération des données</p>');
            },
            beforeSend: function(){
                setOverlay();
            },
            complete: function(){
                removeOverlay();
            }
        });
    }

    // Code permettant de mettre en place la demande de geolocalisation au navigateur
    navigator.geolocation.getCurrentPosition(success, error, options);

});