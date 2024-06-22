import { json } from '@sveltejs/kit';
import { GITHUB_PAT } from '$env/static/private';
import { graphql, GraphqlResponseError } from '@octokit/graphql';
import type { Member } from '$lib/types';

export const GET = async () => {
	try {
		const members = await graphql<{
			organization: {
				membersWithRole: {
					nodes: Array<Member>;
				};
			};
		}>(
			`
				query {
					organization(login: "mozilla") {
						membersWithRole(first: 100) {
							nodes {
								login
								url
								name
								avatarUrl
							}
						}
					}
				}
			`,
			{
				headers: {
					authorization: `token ${GITHUB_PAT}`
				}
			}
		);

		return json(members.organization.membersWithRole.nodes);
	} catch (error) {
		if (error instanceof GraphqlResponseError) {
			return json({ error: error.message }, { status: 500 });
		}
	}
};
