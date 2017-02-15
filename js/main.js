jQuery(document).ready(function($){
	function ProjectMask( element ) {
		this.element = element;
		this.projectTrigger = this.element.find('.project-trigger');
		this.projectClose = this.element.find('.project-close'); 
		this.projectTitle = this.element.find('h1');
		this.projectMask = this.element.find('.mask');
		this.maskScaleValue = 1;
		this.bgImage = this.element.find('.featured-image');
		this.projectContent = this.element.find('.cd-project-info');
		this.projectContentUrl = this.projectContent.data('url');
		this.animating = false;
		this.scrollDown = this.element.find('.cd-scroll');
		this.scrolling = false;
		this.initProject();
	}

	ProjectMask.prototype.initProject = function() {
		var self = this;

		//open the project
		this.projectTrigger.on('click', function(event){
			event.preventDefault();
			if( !self.animating ) {
				self.animating = true;
				//upload project content
				self.uploadContent();
				//scroll the page so that the project section is in the viewport
				if( $(window).scrollTop() == self.element.offset().top ) {
					self.revealProject();
				} else {
					$('body,html').animate({'scrollTop': self.element.offset().top}, 400).promise().then(function() {
						self.revealProject();
					});
				} 
			}
		});

		//close project
		this.projectClose.on('click', function(event){
			event.preventDefault();
			if( !self.animating ) {
				self.animating = true;
		 		//fade project content out
				self.projectTitle.attr('style', 'opacity: 0;');
				self.element.removeClass('content-visible');
				self.projectContent.one(transitionEnd, function(){
					//wait fot the content to disappear before showing title 
					self.projectContent.off(transitionEnd);
					self.projectContent.scrollTop(0);
					self.element.removeClass('center-title');
				});

				// scale down mask and project bg image
				self.element.addClass('scaling-down');
				//repaint element so that the new trasition is applied
				void self.projectMask.get(0).offsetWidth;
				self.projectMask.css('transform', 'translateX(-50%) translateY(-50%)');
				self.bgImage.one(transitionEnd, function(){
					self.bgImage.off(transitionEnd);
					self.animating = false;
					self.maskScaleValue = 1;
					//show the other projects
					self.element.removeClass('project-selected scaling-down').parent('.cd-image-mask-effect').removeClass('project-view');
					$('body,html').scrollTop(self.element.offset().top);
					self.projectTitle.attr('style', '');
					//update the url to main page
					window.history.pushState({path: 'index.html'},'', 'index.html');
				});
			}
		});

		//project content - scroll when clicking the scroll-down arrow
		this.scrollDown.on('click', function(event){
			event.preventDefault();
			self.projectContent.animate({'scrollTop': $(window).height()}, 300)
		});

		//detect scrolling of the project
		this.projectContent.on('scroll', function(){
			if( !self.scrolling ) {
				self.scrolling = true;
				(!window.requestAnimationFrame) ? setTimeout(function(){self.checkScrolling();}) : window.requestAnimationFrame(function(){self.checkScrolling();});
			}
		});
	};

	ProjectMask.prototype.revealProject = function() {
		var self = this;
		//update mask scale value
		self.updateMaskScale();
		//scale up mask and project bg image + hide project title
		self.projectTitle.attr('style', 'opacity: 0;');
		self.projectMask.css('transform', 'translateX(-50%) translateY(-50%) scale('+self.maskScaleValue+')').one(transitionEnd, function(){
			self.projectMask.off(transitionEnd);
			self.animating = false;
			self.element.addClass('center-title');
			self.projectTitle.attr('style', '');
		});

		//hide the other sections
		self.element.addClass('project-selected content-visible').parent('.cd-image-mask-effect').addClass('project-view');
	}
	
	ProjectMask.prototype.updateMask = function() {
		var self = this;
		if( this.element.hasClass('project-selected') ) { //the project is already open - rescale mask
			//update mask scale value
			this.updateMaskScale();
			this.element.addClass('no-transition');

			//triggering reflow so that transition is not applied
			void self.projectMask.get(0).offsetWidth;
			self.projectMask.css('transform', 'translateX(-50%) translateY(-50%) scale('+self.maskScaleValue+')');
			void self.projectMask.get(0).offsetWidth;
			self.element.removeClass('no-transition');
		}
	}

	ProjectMask.prototype.updateMaskScale = function() {
		// scaleMask = viewport diagonal*5 divided by mask width
		this.maskScaleValue = Math.sqrt(Math.pow($(window).height(), 2) + Math.pow($(window).width(), 2))*5*this.maskScaleValue/this.projectMask.width();
	}

	ProjectMask.prototype.uploadContent = function(){
		var self = this;
		if( self.projectContent.find('.content-wrapper').length == 0 ) self.projectContent.load(self.projectContentUrl+'.html .cd-project-info > *');
		
		if( self.projectContentUrl+'.html'!=window.location ){
	        //add the new page to the window.history
	        window.history.pushState({path: self.projectContentUrl+'.html'},'',self.projectContentUrl+'.html');
	    }
	}

	ProjectMask.prototype.checkScrolling =  function() {
		( this.projectContent.scrollTop() > 0 ) ? this.element.addClass('scrolling') : this.element.removeClass('scrolling');
		this.scrolling = false;
	}

	var revealingProjects = $('.cd-project-mask');
	var objProjectMasks = [],
		windowResize = false;

	var transitionEnd = 'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend';

	if( revealingProjects.length > 0 ) {
		revealingProjects.each(function(){
			//create ProjectMask objects
			objProjectMasks.push(new ProjectMask($(this)));
		});
	}

	$(window).on('resize', function(){
		if( !windowResize ) {
			windowResize = true;
			(!window.requestAnimationFrame) ? setTimeout(checkResize) : window.requestAnimationFrame(checkResize);
		}
	});

	function checkResize(){
		objProjectMasks.forEach(function(element){
			element.updateMask();
		});
		windowResize = false;
	}
});