import "./ContextMenu.css"

const ContextMenu = ({
    rightClickItem,
    positionX,
    positionY,
    isToggled,
    buttons,
    contextMenuRef,
}) => {
    return(
        <menu
            style={{
                top: positionY + 2 + 'px',
                left: positionX + 2 + 'px'
            }}
            className={`context-menu ${isToggled ? 'active' : ''}`}
            ref={contextMenuRef}
        >
            {buttons.map((button, index) => {
                function handleClick(e) {
                    e.stopPropagation()
                    button.onClick(e, rightClickItem)
                }

                if (button.isSpacer) return <hr key={index}></hr>

                return (
                    <button onClick={handleClick} key={index} className="contextMenuButton">
                        <span>{button.text}</span>
                        <span className="icon">{button.icon}</span>
                    </button>
                )
            })}
        </menu>
    )
}

export default ContextMenu