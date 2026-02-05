interface BreadcrumbProps {
    path: string[]
    onCrumbClick: (path: string[]) => void
}

export function Breadcrumb({ path, onCrumbClick }: BreadcrumbProps) {
    return (
        <div className="jt-breadcrumb" aria-label="Breadcrumb">
            <button type="button" className="jt-crumb" onClick={() => onCrumbClick([])}>
                root
            </button>
            {path.map((segment, idx) => {
                const segPath = path.slice(0, idx + 1)
                return (
                    <span key={`${idx}-${segment}`} className="jt-crumb-group">
                        <span className="jt-crumb-separator" aria-hidden="true">
                            ›
                        </span>
                        <button
                            type="button"
                            className="jt-crumb"
                            onClick={() => onCrumbClick(segPath)}
                            title={segPath.join('.')}
                        >
                            {segment}
                        </button>
                    </span>
                )
            })}
        </div>
    )
}
