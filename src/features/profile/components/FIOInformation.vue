<script setup lang="ts"></script>

<template>
	<div>
		<h2 class="grow my-auto text-white/80 font-bold text-lg pb-3">
			What is FIO &amp; Why should you use it?
		</h2>

		<div class="flex flex-col gap-y-3">
			<p>
				FIO is a community developed
				<a
					href="https://fio.fnar.net/"
					target="_blank"
					class="text-link-primary underline">
					browser extension</a
				>
				that collects your game data, makes it available outside of
				Prosperous Universe and is completely free to use.
			</p>
			<p>
				Just go ahead and install the Chrome or Firefox extension,
				reload your browser with APEX (Prosperous Universe) open and
				click the extension button in the upper-right in your browser to
				create an account. FIO will automatically collect (only) your
				game data while you keep playing.
			</p>
			<p>
				You can now login to the
				<a
					href="https://fio.fnar.net/"
					target="_blank"
					class="text-link-primary underline">
					FIO website</a
				>
				to see your data and create an API key PRUNplanner will use to
				import your storage (materials you have somewhere) and sites
				(planets, ships, warehouses) data.
			</p>
			<p>
				Creating the key is easy, if you head to the
				<a
					href="https://fio.fnar.net/settings"
					target="_blank"
					class="text-link-primary underline">
					FIO Settings</a
				>
				page and click the "Create API Key" button. Enter a name for
				your key (e.g., "PRUNplanner") and your FIO password. You don't
				need to "Allow Writes" as PRUNplanner will not manipulate any of
				your data, the tool just reads and uses it.
			</p>
			<p>
				Give PRUNplanner a couple of minutes and your game data will
				appear, allowing you to see when to repair ships, what buildings
				you have already constructed when creating or modifying plans or
				when to resupply your bases.
			</p>
			<h3 class="font-bold text-lg">
				5 Easy Steps to Integrate FIO and PRUNplanner
			</h3>
			<ul class="pl-6 list-decimal">
				<li>
					Download and install the
					<a
						href="https://fio.fnar.net/"
						target="_blank"
						class="text-link-primary underline">
						FIO browser extension</a
					>
				</li>
				<li>
					Open your game, click the extensions button and register
					your FIO account
				</li>
				<li>
					Head to the FIO website, open your
					<a
						href="https://fio.fnar.net/settings"
						target="_blank"
						class="text-link-primary underline">
						Settings</a
					>
					and create an API key for PRUNplanner
				</li>
				<li>
					Copy and enter your <strong>FIO API Key</strong> as well as
					your <strong>Prosperous Universe username</strong> to your
					profile above and press the "Update Profile" button
				</li>
				<li>
					Wait a few minutes for PRUNplanner to get your data and
					enjoy additional planning capabilities. Your data will be
					updated automatically in the background, no need to do
					anything.
				</li>
			</ul>
			<p>
				While you're enhancing your gameplay, also check out
				<a
					href="https://fio.fnar.net/settings"
					target="_blank"
					class="text-link-primary underline">
					Refined PrUn</a
				>: Another browser extension greatly simplifying the user
				interface and adding tons of features.
			</p>
		</div>
	</div>
</template>
