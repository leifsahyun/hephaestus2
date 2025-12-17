extends AugmentView

func reset():
	if is_node_ready():
		$IconTexture.texture = augment.icon
