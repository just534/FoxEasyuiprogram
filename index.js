$(function(){
	//设置顶部的3个按钮
	$('#pw,#chguser,#exit').each(function(){
		if(this.id=='pw'){
			icon = 'icon-lock'
		}else if(this.id=='chguser'){
			icon = 'icon-user'
		}else{
			icon = 'icon-exit'
		};
		$(this).linkbutton({
			iconCls:icon,
			plain:true,
			onClick:function(){
				fun($(this).text().trim())
			}
		})
	});
	//设置顶部的主题样式菜单
	var arr = [{
		text: '请选择需要的主题',
		iconCls: 'icon-tmenu',
		children: [{
			text:'默认主题',
			value:'default'
		},{
			text:'bootstrap风格',
			value:'bootstrap'
		},{
			text:'gray风格',
			value:'gray'
		},{
			text:'black风格',
			value:'black'
		},{
			text: 'material系列',
			children: [{
				text:'material风格',
				value:'material'
			},{
				text:'material-teal风格',
				value:'material-teal'
			},{
				text:'material-blue风格',
				value:'material-blue'
			}]
		},{
			text: 'metro系列',
			children: [{
				text:'metro风格',
				value:'metro'
			},{
				text:'metro-blue风格',
				value:'ext-metro/metro-blue'
			},{
				text:'metro-gray风格',
				value:'ext-metro/metro-gray'
			},{
				text:'metro-green风格',
				value:'ext-metro/metro-green'
			},{
				text:'metro-orange风格',
				value:'ext-metro/metro-orange'
			},{
				text:'metro-red风格',
				value:'ext-metro/metro-red'
			}]
		},{
			text: 'jQueryUI系列',
			children: [{
				text:'cupertino风格',
				value:'ext-jqui/ui-cupertino'
			},{
				text:'dark-hive风格',
				value:'ext-jqui/ui-dark-hive'
			},{
				text:'pepper-grinder风格',
				value:'ext-jqui/ui-pepper-grinder'
			},{
				text:'sunny风格',
				value:'ext-jqui/ui-sunny'
			}]
		}]
	}];
	$('#themes').sidemenu({
		width:20,
		height:40,
		border:false,
		data:arr,
		collapsed:true,
		onSelect:function(item){
			var theme = './easyui/themes/' + item.value + '/easyui.css';
			$('#lk').attr('href',theme)
		}
	});
	//设置底部的用户信息
	$('#userinfo').html('当前用户: ' + username + '&nbsp;&nbsp;|');
	//设置导航
	$.getJSON('getAccor',function(data){
		data.forEach(function(value,index){     //遍历数据以生成accordion
			var accid = 'acc' + index;
			$('#menu').append('<div id="' + accid + '" title="' + value + '"></div>');    //添加一个accordion面板
			$('#' + accid).append('<ul id="t' + index + '"></ul>');    //在面板下再增加一个ul以方便生成目录树
		});
		$('#menu').accordion({          //accordion设置
			fit:true,
			border:false,
			onSelect:function (title,index){    //选择不同面板时生成导航树
				$('#t'+index).tree({
					url:'getMenu',
					queryParams:{
						title:title
					},
					onClick:function(node){
						if(username!='admin' && node.users.indexOf(username)==-1){   //用户名如果不是admin而且不在授权名单内
							$.messager.alert('&nbsp;提示','很抱歉，您没有使用本功能的权限','warning').window({iconCls:'icon-logo'})
						}else{
							fun(node.text,node.iconCls,node.id)    //执行相应的功能模块
						}
					}
				});
			}
		});
	})
	//生成主页选项卡
	$('#ts').tabs({
		border:false,
		fit:true
	});
	//设置办公首页
	$('#first').portal({   //将首页作为门户处理
		border:false
	});
	//工作快速导航
	$.getJSON('getMenu',function(data){
		addBt(data);        //执行添加按钮函数
	});
	$('#bts').panel('header').find('.panel-tool').append('<a class="icon-tools"></a>'); //添加设置按钮
	$('a.icon-tools').css('cursor','pointer').click(function(){   //给按钮设置光标样式并绑定单击事件
		$('<div id="tmp"></div>').dialog({
			title:'&nbsp;请选择需要显示的菜单按钮',
			modal:true,
			iconCls:'icon-logo',
			width:320,
			height:300,
			content:'<div id="test"></div>',
			buttons:[{
				text:'确定',
				iconCls:'icon-accept',
				handler:function(){
					var data = $('#test').datalist('getChecked');
					addBt(data);    //执行添加按钮函数
					$.post('updateBtnShow',{       //提交到服务器修改
						rows: JSON.stringify($('#test').datalist('getRows'))
					});
					$('#tmp').dialog('close')
				}
			}],
			onClose:function(){
				$(this).dialog('destroy')
			}
		});
		$('#test').datalist({
			url:'getMenu',
			textField:'text',
			groupField:'menu_1',
			checkbox:true,
			singleSelect:false,
			border:false,
			idField:'id',
			onLoadSuccess:function(data){
				data.rows.forEach(function(obj){
					if(obj.show=='True'){
						var row = $('#test').datalist('selectRecord',obj.id);//根据当前行的Id获取到一个 行对象
						var index = $('#test').datalist('getRowIndex',row);//根据行对象获取到索引值
						$('#test').datalist('checkRow',index);//相对的索引行打上勾
					} 
				})
			},
			onCheck:function(index,row){
				row.show = 'True'
			},
			onUncheck:function(index,row){
				row.show = 'Fasle'
			},
			groupFormatter:function(value){
				return '<span style="color:red">【' + value + '】可选功能项</span>'
			}
		})
	});
	function addBt(data){  //添加按钮函数
		$('#bts').empty();
		var index = 0;
		data.forEach(function(obj){
			if(obj.show=='True'){
				$('#bts').append('<a iconCls=' + obj.icon_large + '>' + obj.text + '</a>');
				$('#bts>a:eq(' + index + ')').linkbutton({
					size:'large',
					iconAlign:'top',
					plain:true,
					disabled: (username!='admin' && obj.users.indexOf(username)==-1) ? true : false,
					onClick:function(){
						fun(obj.text,obj.iconCls,obj.id)    //执行相应的功能模块
					}
				})
				index++;
			}
		})
	};
	//最新销售数据
	var chart = echarts.init($('#sales').panel('body')[0]);   //初始化图表，指定用于显示销售数据的对象
	var cp = [];
	var sl = [];
	var je =[];
	$.getJSON('newData',function(data){
		data.forEach(function(obj){
			cp.push(obj.cp);
			sl.push(obj.sl);
			je.push(obj.je)
		});
		chart.setOption({
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'cross',
					crossStyle: {
						color: '#999'
					}
				}
			},
			toolbox: {
				feature: {
					dataView: {show: true, readOnly: false},
					magicType: {show: true, type: ['line', 'bar','pie']},
					restore: {show: true},
					saveAsImage: {show: true}
				}
			},
			title:{
				text:'产品销售数量及金额分析',
				textStyle:{
					color:'#565487',
					fontSize:14
				},
				left:'left',
				top:5
			},
			legend:{
				x:'center',
				y:'bottom',
				data:['数量','金额']
			},
			xAxis:{data:cp},
			yAxis: [{
				type: 'value',
				max: Math.max.apply([],sl),
				axisLine: {show:false},
				axisTick:{show:false},
				splitLine:{show:false},
				axisLabel:{formatter:''}
			},{
				type: 'value',
				max: Math.max.apply([],je),
				axisLine: {show:false},
				axisTick:{show:false},
				splitLine:{show:false},
				axisLabel:{formatter:''}
			}],
			series:[{
				name:'数量',
				type:'bar',
				data:sl
			},{
				name:'金额',
				type:'line',
				data:je,
				yAxisIndex: 1,
			}],
			grid:{top:40,left:5,right:10,bottom:30,containLabel:true}
		})
	})
	//系统消息
	$('#msg').panel('header').find('.panel-tool').append('<a id="sysmsg" class="icon-reload"></a>');   //添加刷新按钮
	$('#sysmsg').css('cursor','pointer').click(function(){    //给刷新按钮设置光标样式并绑定事件
		getContent('#msg');
	}).click();         //绑定完成后单击
	//操作日志
	getContent('#log');
	//生成消息和日志的函数
	function getContent(jq){
		var url = (jq=='#msg')?'getMsg':'getLogs';
		$.getJSON(url,{user:username},function(data){
			var str = '';     //得到内容
			data.forEach(function(obj){
				if(jq=='#msg'){
					str += '<li>' + obj.title + '</li>'
				}else{
					str += '<li>' + obj.date + ',' + obj.content + ',' + obj.ip + '</li>'
				}
			});
			if(jq=='#msg'){    //对内容再处理
				$(jq).html('<ul>' + str + '</ul>').find('li').each(function(index,obj){
					$(this).tooltip({
						content:$('<div></div>'),
						onUpdate:function(cc){
							cc.panel({
								width:300,
								iconCls:'icon-tip',
								title:data[index].title,
								content:data[index].content + '<p style="text-align:right;color:red">' + 
									'【' + data[index].user + '】发布于' + data[index].date + '</p>'
							})
						},
						onShow:function(){
							$(this).tooltip('tip').css({'box-shadow':'0 0 5px #292929'})
						}
					}).css('cursor','pointer');
				})
			}else{
				$(jq).html('<ul style="padding:0 12px;">' + str + '</ul>').find('li').css({
					'overflow':'hidden',        //超出的文本隐藏
					'white-space':'nowrap',     //溢出不换行
					'text-overflow':'ellipsis', //溢出用省略号显示
				});
			}
		})
	}
	//功能模块函数
	function fun(str,icon,id){    //第1个参数为功能项标题，第2个参数为图标，第3个参数为id
		$.post('logs',{      //记录操作日志
			user:username,
			xm:str
		});
		switch(str.trim()){
			case '切换用户':
				if(!$('#login').length){
	  				$('#dlg').load('./login.html #login',function(){
		  				$.getScript('./login.js')
		  			});
				}else{
					$('#login').dialog('open');
				};
				break;
			case '安全退出':
				$.messager.confirm('&nbsp;提示','该操作将删除本地用户登录信息！<br>确认安全退出吗？',function(r){
					if(r){
						$.cookie('user','');
						$.cookie('password','');
						location.replace('./login.html')   //以登录页面替换当前页面
					}
				}).window({iconCls:'icon-logo'})
				break;
			case '修改密码':
				$.messager.prompt('&nbsp;密码确认','请输入原密码：',function(v){
					if(v){    //如果输入的密码不为空
						if(v!=$.cookie('password')){
							$.messager.alert('&nbsp;警告','密码输入错误，您无权修改密码！','warning').window({iconCls:'icon-logo'})
						}else{
							$('<div id="psd"></div>').dialog({
								title:'&nbsp;修改密码',
								modal:true,
								iconCls:'icon-logo',
								width:280,
								height:240,
								content:'<div><p>请输入新密码<input id="ip1"></p>请再输入一遍<input id="ip2"></p></div>',
								buttons:[{
									text:'确定',
									iconCls:'icon-accept',
									handler:function(){
										var ip1 = $('#ip1').textbox('getValue');
										var ip2 = $('#ip2').textbox('getValue');
										if(!ip1){
											$.messager.alert('&nbsp;警告','新设置的密码不得为空！','warning',function(){
												$('#ip1').textbox('textbox').focus()
											}).window({iconCls:'icon-logo'})
										}else if(ip1==ip2){
											$.post('updatePsd',{
												user:username,
												psd:ip1
											},function(){
												$.cookie('password',ip1);
												$.messager.alert('&nbsp提示信息','密码修改成功！','info',function(){
													$('#psd').dialog('close')
												})
											})
										}else{
											$.messager.alert('&nbsp;警告','两次输入的密码并不相同！','warning',function(){
												$('#ip1').textbox('textbox').focus()
											}).window({iconCls:'icon-logo'})
										}
									}
								}],
								onClose:function(){
									$(this).dialog('destroy')
								}
							}).dialog('body').css({    //给对话框的内容部分设置样式
								'padding':'6px',
								'text-align':'center'
							});
							$('#ip1,#ip2').textbox()   //给对话框中的两个输入框使用textbox
						}
					}
				}).window({iconCls:'icon-logo'}).find('input').focus();    //弹出输入确认框时，将焦点定位到输入框
				break;
			default:    //其他默认都是选项卡中的表格操作
				if($('#ts').tabs('exists',str)){   //如果指定选项卡面板存在就选择它
					$('#ts').tabs('select',str);
				}else{                             //否则新建选项卡面板
					$('#ts').tabs('add',{
						title:str,
						iconCls:icon,
						closable:true,
						href:'./page/page_' + id + '.html',      //加载页面
						onLoad:function(){
							$.getScript('./page/page_' + id + '.js')   //加载该页面的js处理程序
						}
					});
				}
		};
	};
	//自适应浏览器窗口
	$('body').layout('panel','center').panel({
		onResize:function(w,h){
			$('#first').portal('resize',{
				width:w-2,
				height:h-2
			});
		}
	});
})