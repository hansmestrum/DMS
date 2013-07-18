!function ($) {


	/*
	 * AJAX Actions
	 */
	$.plAJAX = {

		// Generalized AJAX Function
		run: function( args ){

			var	that = this
			,	theData = {
						action: 'pl_editor_actions'
					,	mode: 'default'
					,	run: 'default'
					,	pageID: $.pl.config.pageID
					,	typeID: $.pl.config.typeID
					,	log: false
					,	confirm: false
					, 	confirmText: 'Are you sure?'
					,	savingText: 'Saving'
					,	refresh: 	false
					,	refreshText: 'Refreshing page...'
					, 	toolboxOpen: $.toolbox('open')
					,	beforeSend: ''
					, 	postSuccess: ''

				}

			// merge args into theData, overwriting theData w/ args
			$.extend(theData, args)

			if( theData.confirm ){

				if( theData.toolboxOpen && ( theData.refresh || theData.confirm ) )
					$.toolbox('hide')

				bootbox.confirm( theData.confirmText, function( result ){

					if(result == true){
						that.runAction( theData )
					} else {

						if( theData.toolboxOpen && ( theData.refresh || theData.confirm ) )
							$('body').toolbox('show')
					}

				})

			} else {

				that.runAction( theData )

			}


			return ''
		}

		, runAction: function( theData ){

			var that = this
			$.ajax( {
					type: 'POST'
				, 	url: ajaxurl
				, 	data: theData
				, 	beforeSend: function(){

						$('.btn-saving').addClass('active')

						if ( $.isFunction( theData.beforeSend ) )
							theData.beforeSend.call( this )

						if( theData.refresh ){

							$.toolbox('hide')
							$.pl.flags.refreshing = true
							bootbox.dialog( that.dialogText( theData.savingText ), [ ], {animate: false})
						}


					}
				, 	error: function( jqXHR, status, error ){
					plPrint('AJAX Error')
					plPrint( status )
					plPrint( error )
				}
				, 	success: function( response ){

						that.runSuccess( theData, response )

						if( theData.refresh ){

							// reopen toolbox after load if it was shown
							if( theData.toolboxOpen )
								store.set('toolboxShown', true)

							bootbox.dialog( that.dialogText( theData.refreshText ), [ ], {animate: false})
							
							window.onbeforeunload = null
							location.reload()

						} else {

							if( theData.toolboxOpen && theData.confirm && !$.pl.flags.refreshing )
								$('body').toolbox('show')

						}

					}
			})
		}

		, runSuccess: function( theData, response ){
			if(log == 'true')
				plPrint(response)

			var that = this
			,	rsp	= $.parseJSON( response )
			,	log = (rsp.post) ? rsp.post.log || false : ''

			if(log == 'true')
				plPrint(rsp)

			if ( $.isFunction( theData.postSuccess ) )
				theData.postSuccess.call( this, rsp )

			that.ajaxSuccess(rsp)
		}

		, init: function(){


			this.bindUIActions()

		}

		, saveData: function( opts ){
			
			var args = {
					mode: 'save'
				,	savingText: 'Saving Settings'
				,	refresh: false
				,	refreshText: 'Settings successfully saved! Refreshing page...'
				, 	log: true
				,	pageData: $.pl.data
				,	run: 'draft'
			}
			
			$.pageBuilder.updatePage({ location: 'save-data' })

			$.extend( args, opts )

			var response = $.plAJAX.run( args )

		}



		, toggleEditor: function(){

			var that = this
			,	theData = {
					action: 'pl_editor_mode'
					,	userID: $.pl.config.userID
				}

			confirmText = sprintf("<h3>Turn Off PageLines Editor?</h3><p>(Note: Draft mode is disabled when editor is off.)</p>")
			bootbox.confirm( confirmText, function( result ){
				if(result == true){
					$.ajax( {
						type: 'POST'
						, url: ajaxurl
						, data: theData
						, beforeSend: function(){
							bootbox.dialog( that.dialogText('Deactivating...'), [], {animate: false})
						}
						, success: function( response ){


							bootbox.dialog( that.dialogText('Editor deactivated! Reloading page.'), [], {animate: false})
							
							window.location = $.pl.config.currentURL
						}
					})
				}
			})

		}

		, bindUIActions: function(){

			var that = this

			$( '.btn-publish' ).on('click.saveButton', function(){

				$.plAJAX.saveData( { 
					run: 'publish'
				} )


			})
			
			$( '.btn-refresh' ).on('click.saveButton', function(){
				location.reload()

			})


			$('.btn-revert').on('click.revertbutton', function(e){
					e.preventDefault()

					var revert = $(this).data('revert')
					,	args = {
								mode: 'save'
							,	run: 'revert'
							,	confirm: true
							,	confirmText: "<h3>Are you sure?</h3><p>This will revert <strong>"+revert+"</strong> changes to your last published configuration.</p>"
							,	savingText: 'Reverting Draft'
							,	refreshText: 'Template successfully updated!'
							,	refresh: true
							, 	log: true
							,	revert: revert
						}

					var response = $.plAJAX.run( args )


			})





		}


		, ajaxSuccess: function( response ){

				var state = response.state || false

				$('.btn-saving').removeClass('active')


				$('#stateTool')
					.removeClass()
					.addClass('dropup')

				$.each(state, function(index, el){
					
					$('#stateTool').addClass(el)
				})
				
				if( typeof state == 'object' && Object.keys(state).length > 0 ){
					pl_show_unload( )
				} else {
					window.onbeforeunload = null
				}
				

		}


		, dialogText: function( text ){

			var dynamo = '<div class="progress progress-striped active"><div class="bar" style="width: 100%;"></div></div>'
			, 	theHTML = sprintf('<div class="spn"><div class="spn-txt">%s</div>%s</div>', text, dynamo)
			
			
			return theHTML


		}
	}



}(window.jQuery);