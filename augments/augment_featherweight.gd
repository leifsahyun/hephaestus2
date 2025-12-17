extends Augment

func on_equip(context):
	context.add_hubris(-10)
	context.battle_complete.connect(on_battle_complete)

func on_battle_complete():
	ItemPool.erase(item)
