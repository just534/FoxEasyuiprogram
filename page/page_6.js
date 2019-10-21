$(function(){
	//表格工具栏
	$('#table6_tool>input').each(function(index){
		var label,data,value;
		switch(index){
			case 0:
				label = '分组项目';
				data = [{text:'产品ID'},{text:'客户ID'}];
				value = '产品ID';
				break;
			case 1:
				label = '统计项目';
				data = [{text:'数量'},{text:'金额'}];
				value = '数量';
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
			value:value,
			multiple:true
		});
	});
	//统计操作
	$('#table6_tj').linkbutton({
		iconCls:'icon-property',
		plain:true,
		onClick:function(){
			var table = {
				group:$('#table6_tool>input').eq(0).combobox('getValues').toString(),
				total:$('#table6_tool>input').eq(1).combobox('getValues').toString()
			};
			$.getJSON('./../getGroupTable',table,function(data){
				//生成多层表头
				var titles = data.titles[0];
				var newTitles = [[],[]];
				titles.forEach(function(obj){
					if(obj.field==obj.title){    //如果列名和列标题相同，表示不需分层
						$.extend(obj,{rowspan:2});
						newTitles[0].push(obj)
					}else{                       //否则进行分层处理
						if(obj.field.indexOf('gdr') == -1){
							newTitles[0].push({title:obj.field,colspan:2})
						}
						newTitles[1].push($.extend(obj,{
							field:obj.field,
							title:obj.title.slice(obj.title.indexOf('_')+1),
							formatter:function(value){
								if(obj.field=='金额'){
									return Number(value).toFixed(2)
								}else if(obj.field.indexOf('gdr')!=-1){
									return (value!='0') ? (value*100).toFixed(2) + '%' : ''
								}else{
									return value
								}
							}
						}))
					}
				});
				$('#table6_table').datagrid({        //获取成功后生成数据表
					border:false,
					fit:true,
					toolbar:'#table6_tool',    //绑定表格工具栏
					columns:newTitles,         //设定表头
					data:data.rows,            //设置表数据
					striped:true,
					rownumbers:true,
					singleSelect:true,
					onLoadSuccess:function(data){
						var tab = $('#table6_tab');
						tab.tabs('select',0).tabs('update',{
							tab:tab.tabs('getTab','图表分析'),
							options:{
								selected:true,
								content:'<div id="table6_tmp" style="width:100%;height:100%"></div>'
							}
						});
						//生成图表，仅以第1个分组和第1个统计项目为例
						var chart = echarts.init($('#table6_tmp')[0]);   //初始化图表
						var gn = table.group.split(',')[0];
						var tn = table.total.split(',')[0];
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
								type:'line',
								data:t
							}],
							grid:{top:30,left:10,right:10,bottom:10,containLabel:true}
						})
					},
					onSelect:function(index,row){
						var tab = $('#table6_tab');
						var tabTitle = tj = '';
						table.group.split(',').forEach(function(value){
							tabTitle += '-' + row[value];
							tj += " and " + value + "='" + row[value] + "'"
						})
						tabTitle = '【' + tabTitle.slice(1) + '】';
						if(!tab.tabs('exists',tabTitle)){
							tab.tabs('add',{
								title:tabTitle,
								iconcls:'icon-edit',
								closable:true,
								content:'<div id="table6_' + tabTitle + '"></div>'
							});
							var q = {
								tablename:'订单',
								cols:'产品ID,客户ID,单价,折扣,数量,日期',
								tj:tj.slice(5)
							};
							$.getJSON('./../getTableTitles',q,function(data){
								$('#table6_' + tabTitle).datagrid({
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
	$('#table6_dc').linkbutton({
		iconCls:'icon-toexcel',
		plain:true,
		onClick:function(){
			$('#table6_table').datagrid('toExcel','订单统计数据.xls');
		}
	});
	//打印操作
	$('#table6_dy').linkbutton({
		iconCls:'icon-print',
		plain:true,
		onClick:function(){
			$('#table6_table').datagrid('print','订单统计表');
		}
	});
})