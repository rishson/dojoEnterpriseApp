//Declare out the name of the test module to make dojo's module loader happy.
dojo.provide("test.doh.widget.TestApplicationWidget");

dojo.require('rishson.enterprise.widget._Widget');
dojo.require('rishson.enterprise.widget._ApplicationWidget');

doh.register("_ApplicationWidget tests", [
    
    {
        name: "Pub/sub tests",
        setUp: function(){
			dojo.declare('childWidget', [rishson.enterprise.widget._Widget], {
				constructor : function(params) {
					this.pubList('/some/topicName');			
				}			
			});

			dojo.declare('parentWidget', [rishson.enterprise.widget._ApplicationWidget], {
				constructor : function(params) {
				},
	

				_handleTopicName : function(){
					horribleGlobalScopeHack = true;
				}			
			});

			var myChildWidget = new childWidget();
			var myApplicationWidget = new applicationWidget();
        },
        runTest: function(){
			myApplicationWidget.injectWidget(myChildWidget);

			dojo.publish('/some/topicName', []);
			
			doh.assertTrue(horribleGlobalScopeHack, 'Autowire faied.');
        },
        tearDown: function(){
        }
    }

]);
