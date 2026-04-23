$( document ).ready(function() {
	

	// LOGOS
	$.ajax({					
		async: false,
		url: "data/logos.json"
	})
	.done(function( data ) {
		var data = data.logosEmpreses;

		$.each( data, function( key, value ) {
			
			var logo = `<div class="logoEmpreses">
							<a href="` + value.url + `" target="_blank"><img src="img/logos/` + value.img + `" alt="` + value.alt + `"></a>
						</div>`;

			$(".logosEmpresesDual .empreses").append(logo); 
		});
	});

});
