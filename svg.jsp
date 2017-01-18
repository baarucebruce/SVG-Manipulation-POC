<dsp:page>
	<vsg:sketch title="SVG" metaKeywords="svg" metaDescription="svg" page="svg" type="content">
		<dsp:include page="/includes/gadgets/endecaAssemble.jsp">
			<dsp:param name="contentCollection" value="/content/Header/HeaderCollection"/>
			<dsp:param name="defaultPage" value=""/>
		</dsp:include>
		
		<div class="page-block">
			
			<ul class="cf breadcrumbs">
				<li><a class="ico" href="${productionURL}" title="Home">Home</a></li>
				<li><a class="ico" href="#" title="SVG">SVG Manipulation</a></li>
			</ul>
			
			<div id="pageTitle">
				<h1 class="title">SVG Manipulation</h1>
			</div>
			<dsp:include page="/sketch/svg/main.jsp"/>
		</div>
		<dsp:include page="/sketch/footer/footer.jsp" />
	</vsg:sketch>
</dsp:page>