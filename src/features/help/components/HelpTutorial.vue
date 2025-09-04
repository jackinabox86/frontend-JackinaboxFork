<script setup lang="ts"></script>

<template>
	<div class="flex flex-col gap-y-6">
		<section class="bg-white/10 p-3 rounded">
			PRUNplanner helps you design bases, organize empires, and calculate
			profits — without wasting in-game resources. It mirrors nearly every
			aspect of
			<span class="italic">Prosperous Universe</span> so you can plan
			smarter and play more confidently.
		</section>

		<section>
			<div
				class="grid grid-cols-1 xl:grid-cols-[60%_auto] gap-3 gap-x-10">
				<div>
					<h2 class="text-lg font-bold mb-3">Getting Started</h2>
					<ol class="list-decimal space-y-2 pl-4">
						<li>
							<strong>
								Create an Empire in
								<router-link
									to="/manage"
									class="text-link-primary">
									Management</router-link
								>:</strong
							>
							By default, you'll already have one. But you can add
							more for different factions or regions. Assign a
							name and faction, and save.
						</li>
						<li>
							<strong>
								Set up an
								<router-link
									to="/exchanges"
									class="text-link-primary">
									Exchange</router-link
								>:</strong
							>
							Go into Management and create your exchange. Switch
							to the Exchanges view to modify it. For most
							players, set it to
							<em>Both</em> (buying and selling) and choose the
							exchange your bases will use (e.g., CI1 for Benten).
							Save it.
						</li>
						<li>
							<strong>
								Search for a
								<router-link
									to="/search"
									class="text-link-primary">
									Planet</router-link
								>:</strong
							>
							Use the planet search to filter by resources,
							programs, or proximity to a CX. Select your target
							planet and view its modifiers, extraction rates, and
							infrastructure.
						</li>
						<li>
							<strong>Create a Plan:</strong>
							Choose your Empire, give it a name, then add
							buildings. For example: add a Refinery, set a
							production order, and save the plan. You can modify
							all aspects like COGC, expert bonuses and dive into
							optimizations.
						</li>
						<li>
							<strong>Check ROI:</strong>
							Once set up, you'll see daily profits, inputs and
							outputs, and return on investment for each
							production line. Adjust, experiment, and optimize.
						</li>
					</ol>
				</div>
				<div class="flex flex-col justify-center gap-y-3">
					<div class="text-end">
						<img
							src="/images/help/management-screenshot.png"
							alt="Management Screenshot"
							class="rounded shadow-lg border border-white/10" />
						<span class="text-xs text-white/60">Management</span>
					</div>
				</div>
			</div>
		</section>

		<section>
			<div class="grid grid-cols-1 xl:grid-cols-[30%_auto] gap-3 gap-x-6">
				<div>
					<div class="bg-white/10 rounded p-3">
						<h2 class="text-lg font-bold mb-3">Core Concepts</h2>
						<div class="space-y-6">
							<div>
								<h3 class="text-lg mb-1">Plans</h3>
								<p class="text-white/80">
									A plan represents a single base: its
									buildings, productions, and bonuses. Create
									a plan by choosing a planet, placing
									buildings, and assigning it to an Empire
									with a CX preference.
								</p>
							</div>
							<div>
								<h3 class="text-lg mb-1">Empires</h3>
								<p class="text-white/80">
									An Empire is a container of multiple plans —
									essentially your entire network of bases.
									Empires keep your supply chains organized
									and allow you to manage multiple bases
									together.
								</p>
							</div>
							<div>
								<h3 class="text-lg mb-1">Exchanges</h3>
								<p class="text-white/80">
									Exchange settings define how prices are
									calculated. Each Empire uses one Exchange
									for consistency. You can reuse the same
									Exchange setup across empires if needed.
								</p>
							</div>
						</div>
					</div>
				</div>
				<div class="p-3">
					<h2 class="text-lg font-bold mb-3">Key Features</h2>
					<div class="space-y-6">
						<div>
							<h3 class="text-lg">Base Simulation</h3>
							<p class="text-white/80">
								Design and test bases without spending
								resources. From habitation to production to
								planet-specific modifiers and bonuses —
								PRUNplanner simulates it all.
							</p>
						</div>
						<div>
							<h3 class="text-lg">Empire Planning</h3>
							<p class="text-white/80">
								Manage your empire across multiple bases and
								supply chains. Keep your materials flowing,
								prevent bottlenecks, and run smoothly at scale.
								Always see what is going on and where the next
								best expansion starts.
							</p>
						</div>
						<div>
							<h3 class="text-lg">Game Data</h3>
							<p class="text-white/80">
								Market information is integrated directly from
								FIO, the community API. Plan expansions, check
								ROI, and make informed trade decisions. Explore
								historic market data or let PRUNplanner
								calculate production or resource extraction
								ROIs.
							</p>
						</div>
						<div>
							<h3 class="text-lg">Burn & Repair</h3>
							<p class="text-white/80">
								Track consumables and building wear. Avoid
								shortages and downtime by seeing exactly what
								your colony needs and when it needs it.
							</p>
						</div>
						<div>
							<h3 class="text-lg">
								A Wealth of Additional Tools
							</h3>
							<p class="text-white/80">
								Dive into historical prices, optimize habitation
								layouts, estimate visitation frequencies, and
								fine-tune production efficiency. PRUNplanner is
								packed with utilities to give you the edge.
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	</div>
</template>
