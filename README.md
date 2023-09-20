# Install & run messaging service

<div id="main-content" class="wiki-content group">
                    <h2 id="Installandrunmessagingservice-Installation">Installation</h2><div class="code panel pdl" style="border-width: 1px;"><div class="codeContent panelContent pdl">
<pre class="syntaxhighlighter-pre" data-syntaxhighlighter-params="brush: java; gutter: false; theme: Confluence" data-theme="Confluence">npm install</pre>
</div></div><h2 id="Installandrunmessagingservice-Configuring">Configuring</h2><p>The service needs a dotenv file to run. This dotenv file will be loaded in the environment variables. Here’s what the app needs:</p><div class="table-wrap"><table data-layout="default" class="confluenceTable"><tbody><tr><th class="confluenceTh"><p><strong>Environement key</strong></p></th><th class="confluenceTh"><p><strong>Summary</strong></p></th><th class="confluenceTh"><p><strong>Required by</strong></p></th></tr><tr><td class="confluenceTd"><p><code>AUTH_URL</code></p></td><td class="confluenceTd"><p>Auth net service URL</p></td><td class="confluenceTd"><p><code>@thefirstspine/auth-nest</code></p></td></tr><tr><td class="confluenceTd"><p><code>PRIVATE_KEY</code></p></td><td class="confluenceTd"><p>Private key to validate protected incoming requests</p></td><td class="confluenceTd"><p><code>@thefirstspine/certificate-authority</code></p></td></tr><tr><td class="confluenceTd"><p><code>PORT</code></p></td><td class="confluenceTd"><p>The port where to serve the app</p></td><td class="confluenceTd"><p>App</p></td></tr></tbody></table></div><h2 id="Installandrunmessagingservice-Runningtheapp">Running the app</h2><div class="code panel pdl" style="border-width: 1px;"><div class="codeContent panelContent pdl">
<pre class="syntaxhighlighter-pre" data-syntaxhighlighter-params="brush: java; gutter: false; theme: Confluence" data-theme="Confluence">npm run start</pre>
</div></div><h2 id="Installandrunmessagingservice-Build&amp;runforproduction">Build &amp; run for production</h2><div class="code panel pdl" style="border-width: 1px;"><div class="codeContent panelContent pdl">
<pre class="syntaxhighlighter-pre" data-syntaxhighlighter-params="brush: java; gutter: false; theme: Confluence" data-theme="Confluence">npm run build
node dist/main.js</pre>
</div></div><p>
                    </p></div>
