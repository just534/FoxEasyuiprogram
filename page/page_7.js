$(function(){
	//表格工具栏
	$('#table7_tool>input').each(function(index){
		var label,data,value;
		switch(index){
			case 0:
				label = '水平分组';
				data = [{text:'产品ID'},{text:'客户ID'}];
				value = '产品ID';
				break;
			case 1:
				label = '垂直分组';
				data = [{text:'产品ID'},{text:'客户ID'}];
				value = '客户ID';
				break;
		};
		$(this).combobox({
			label:'&nbsp;&nbsp;' + label,
			labelWidth:72,
			panelHeight:'auto',
			width:180,
			data:data,
			valueField:'text',
			editable:false,
			value:value
		});
	});
	//统计操作
	$('#table7_tj').linkbutton({
		iconCls:'icon-property',
		plain:true,
		onClick:function(){
			var table = {
				hgroup:$('#table7_tool>input').eq(0).combobox('getValue'),
				vgroup:$('#table7_tool>input').eq(1).combobox('getValue')
			};
			$.getJSON('./../getCrossTable',table,function(data){
				//生成多层表头
				var titles = data.titles;
				var newTitles = [[],[]];
				titles.forEach(function(obj){
					if(obj.title.indexOf('_') == -1){    //如果列标题中没有下划线，表示不需分层
						$.extend(obj,{rowspan:2});
						newTitles[0].push(obj)
					}else{                       //否则进行分层处理
						if(obj.title.indexOf('_') != -1 && (/(_\d)$/.test(obj.field) || obj.field=='合计_数量')){    //如果列标题包含_且列名以_加数字结尾
							newTitles[0].push({
								title:obj.title.slice(0,obj.title.indexOf('_')),
								colspan:(obj.field=='合计_数量') ? 2 : 3
							})
						}
						newTitles[1].push($.extend(obj,{
							field:obj.field,
							title:obj.title.slice(obj.title.indexOf('_')+1),
							formatter:function(value){
								if(/hp$|vp$/.test(obj.field) || obj.field=='合计_占比'){    //如果字段名以hp或vp结尾
									return (value!=0) ? (value*100).toFixed(2) + '%' : ''
								}else{
									return (value!=0) ? value : ''
								}
							}
						}))
					}
				});
				$('#table7_table').datagrid({        //获取成功后生成数据表
					border:false,
					fit:true,
					toolbar:'#table7_tool',    //绑定表格工具栏
					columns:newTitles,         //设定表头
					data:data.rows,            //设置表数据
					striped:true,
					rownumbers:true,
					singleSelect:true,
					onLoadSuccess:function(data){
						var tab = $('#table7_tab');
						tab.tabs('select',0).tabs('update',{
							tab:tab.tabs('getTab','图表分析'),
							options:{
								selected:true,
								content:'<div id="table7_tmp" style="width:100%;height:100%"></div>'
							}
						});
						//生成图表，仅以第1个分组和第1个统计项目为例
						var chart = echarts.init($('#table7_tmp')[0]);   //初始化图表
						var gn = table.hgroup;
						var tn = '合计_数量';
						var g = [];
						var t = [];
						data.rows.forEach(function(obj){
							if(obj[gn]!='合计'){
								g.push(obj[gn]);
								t.push(obj[tn])
							}
						});
						chart.setOption({
							title:{
								text:'数据统计分析',
								textStyle:{
									color:'#565487',
									fontSize:14
								},
								left:'center',
								top:5
							},
							legend:{
								x:'right',
								data:[tn]
							},
							xAxis:{data:g},
							yAxis:{},
							series:[{
								name:tn,
								type:'bar',
								data:t
							}],
							grid:{top:30,left:10,right:10,bottom:10,containLabel:true}
						})
					},
					onSelect:function(index,row){
						var tab = $('#table7_tab');
						var tabTitle = '【' + row[table.hgroup] + '】';
						var tj = table.hgroup + "='" + row[table.hgroup] + "'";
						if(!tab.tabs('exists',tabTitle)){
							tab.tabs('add',{
								title:tabTitle,
								iconcls:'icon-edit',
								closable:true,
								content:'<div id="table7_' + tabTitle + '"></div>'
							});
							var q = {
								tablename:'订单',
								cols:'产品ID,客户ID,单价,折扣,数量,日期',
								tj:tj
							};
							$.getJSON('./../getTableTitles',q,function(data){
								$('#table7_' + tabTitle).datagrid({
									border:false,
									fit:true,
									columns:data,
									url:'./../getTableData',
									queryParams:q,
									pagination:true,
									striped:true,
									rownumbers:true,
								})
							})
						}else{
							tab.tabs('select',tabTitle)
						};
					}
				})
			});
		},
	}).click();
	//导出操作
	$('#table7_dc').linkbutton({
		iconCls:'icon-toexcel',
		plain:true,
		onClick:function(){
			$('#table7_table').datagrid('toExcel','订单统计数据.xls');
		}
	});
	//打印操作
	$('#table7_dy').linkbutton({
		iconCls:'icon-print',
		plain:true,
		onClick:function(){
			$('#table7_table').datagrid('print','订单统计表');
		}
	});
})