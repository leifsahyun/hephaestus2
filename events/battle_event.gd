class_name BattleTimelineEvent
extends TimelineEvent

var hero
var monster

func initialize():
	hero = HeroPool.draw()
	monster = MonsterPool.draw()
	description = hero.name + " vs. The " + monster.name
