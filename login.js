$(function(){
	$('#login').dialog({      //将登录内容显示为对话框
		title:'&nbsp;登录窗口',
		width:380,
		height:350,
		iconCls:'icon-logo',
		modal:true,
		draggable:false,
		closable:false,
	});
	$('#user').combobox({    //设置用户名编辑框
		required:true,
		url:'dataList',
		queryParams:{
			tablename:'用户',
			cols:'用户名'
		},
		textField:'用户名',
		valueField:'用户名',
		panelHeight:160,
		mode:'remote',
		icons:[{
			iconCls:'icon-clear',
			handler:function(e){
				$(e.data.target).combobox('clear')
			}
		}],
		value: $.cookie('user')
	});
	$('#password').passwordbox({   //设置密码框
		required:true,
		value: $.cookie('password')
	});
	$('button').linkbutton({     //设置按钮
		iconCls:'icon-key',
		onClick:function(){
			if(!$('#user').combobox('isValid')){
				$.messager.alert('&nbsp;警告','用户名不得为空！','warning',function(){
					$('#user').combobox('textbox').focus()
				}).window({iconCls:'icon-logo'});
			}else if(!$('#password').passwordbox('isValid')){
				$.messager.alert('&nbsp;警告','密码不得为空！','warning',function(){
					$('#password').passwordbox('textbox').focus()
				}).window({iconCls:'icon-logo'});
			}else if(/[']|[o][r]/.test($('#password').passwordbox('getValue'))){
				$.messager.alert('&nbsp;警告','请不要在密码中输入非法字符！','warning',function(){
					$('#password').passwordbox('textbox').focus()
				}).window({iconCls:'icon-logo'});				
			}else{
				$.post('login',{
					user:$('#user').val(),
					password:$('#password').val()
				},function(data){
					if(data=='0'){
						$.messager.alert('&nbsp;警告','用户名或密码不正确，请重新输入！','warning',function(){
							$('#user').combobox('textbox').focus()
						}).window({iconCls:'icon-logo'});		
					}else{
						$.cookie('user',$('#user').val())
						$.cookie('password',$('#password').val());
						$.get('logs',{        //保存日志
							user:$.cookie('user'),
							xm:'登录系统'
						},function(){         //跳转到主页
							location = 'index.html'
						});
					}
				})
			}
		}
	});
})