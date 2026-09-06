import { lazy, Suspense } from "react";
// Browser-only equivalent of the original Next dynamic import. The actual
// imported viewport remains responsible for its geometry, assets and controls.
export default function dynamic(loader, options = {}) {
	const Component = lazy(async () => {
		const module = await loader();
		return typeof module === "function" ? { default: module } : module;
	});
	return function FilmDynamic(props) {
		const Loading = options.loading;
		return (
			<Suspense fallback={Loading ? <Loading /> : null}>
				<Component {...props} />
			</Suspense>
		);
	};
}
